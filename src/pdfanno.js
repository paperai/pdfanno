require("file-loader?name=dist/index.html!./index.html")
require("!style-loader!css-loader!./pdfanno.css")

import axios from 'axios'
import Fuse from 'fuse.js'

// UI parts.
import * as annoUI from 'anno-ui'

import { dispatchWindowEvent } from './shared/util'
import { convertToExportY, convertFromExportY, getPageSize, paddingBetweenPages } from './shared/coords'
import {
    listenWindowLeaveEvent,
    unlistenWindowLeaveEvent,
    resizeHandler
} from './page/util/window'
import * as publicApi from './page/public'
import PDFAnnoPage from './page/pdf/PDFAnnoPage'

/**
 * Default PDF Name.
 */
const DEFAULT_PDF_NAME = 'P12-1046.pdf'

/**
 * API root point.
 */
let API_ROOT = 'http://localhost:8080'
if (process.env.NODE_ENV === 'production') {
    console.log('PRODUCTION MODE')
    API_ROOT = 'https://pdfanno.hshindo.com'
}
window.API_ROOT = API_ROOT

/**
 * Global variable.
 */
window.pdfanno = {}

/**
 * Expose public APIs.
 */
window.add = publicApi.addAnnotation
window.addAll = publicApi.addAllAnnotations
window.delete = publicApi.deleteAnnotation
window.RectAnnotation = publicApi.PublicRectAnnotation
window.SpanAnnotation = publicApi.PublicSpanAnnotation
window.RelationAnnotation = publicApi.PublicRelationAnnotation
window.readTOML = publicApi.readTOML
window.clear = publicApi.clear

/**
 * Annotation functions for a page.
 */
window.annoPage = new PDFAnnoPage()


// Manage ctrlKey (cmdKey on Mac).
window.addEventListener('manageCtrlKey', e => {
    window.annoPage.manageCtrlKey(e.detail)
})

// Manage digitKey.
window.addEventListener('digitKeyPressed', e => {
    dispatchWindowEvent(`digit${e.detail}Pressed`)
})

/**
 * Get the y position in the annotation.
 */
function _getY(annotation) {

    if (annotation.rectangles) {
        return annotation.rectangles[0].y

    } else if (annotation.y1) {
        return annotation.y1

    } else {
        return annotation.y
    }
}

/**
 *  The entry point.
 */
window.addEventListener('DOMContentLoaded', e => {

    // Delete prev annotations.
    window.annoPage.clearAllAnnotations()

    // resizable.
    annoUI.util.setupResizableColumns()

    // Start event listeners.
    annoUI.event.setup()

    // Browse button.
    annoUI.browseButton.setup({
        loadFiles : window.annoPage.loadFiles,
        clearAllAnnotations : window.annoPage.clearAllAnnotations,
        displayCurrentReferenceAnnotations : () => window.annoPage.displayAnnotation(false, false),
        displayCurrentPrimaryAnnotations : () => window.annoPage.displayAnnotation(true, false),
        getContentFiles : () => window.annoPage.contentFiles,
        getAnnoFiles : () => window.annoPage.annoFiles,
        closePDFViewer : window.annoPage.closePDFViewer
    })

    // PDF dropdown.
    annoUI.contentDropdown.setup({
        initialText : 'PDF File',
        overrideWarningMessage : 'Are you sure to load another PDF ?',
        contentReloadHandler : fileName => {

            // Get the content.
            const content = window.annoPage.getContentFile(fileName)

            // Reset annotations displayed.
            window.annoPage.clearAllAnnotations()

            // Display the PDF on the viewer.
            window.annoPage.displayViewer(content)
        }
    })

    // Primary anno dropdown.
    annoUI.primaryAnnoDropdown.setup({
        clearPrimaryAnnotations : window.annoPage.clearAllAnnotations,
        displayPrimaryAnnotation : annoName => window.annoPage.displayAnnotation(true)
    })

    // Reference anno dropdown.
    annoUI.referenceAnnoDropdown.setup({
        displayReferenceAnnotations : annoNames =>window.annoPage.displayAnnotation(false)
    })

    // Anno list dropdown.
    annoUI.annoListDropdown.setup({
        getAnnotations : () => {

            // Get displayed annotations.
            let annotations = window.annoPage.getAllAnnotations()

            // Filter only Primary.
            annotations = annotations.filter(a => {
                return !a.readOnly
            })

            // Sort by offsetY.
            annotations = annotations.sort((a1, a2) => {
                return _getY(a1) - _getY(a2)
            })

            return annotations
        },
        scrollToAnnotation : window.annoPage.scrollToAnnotation
    })

    // Download button.
    annoUI.downloadButton.setup({
        getAnnotationTOMLString : window.annoPage.exportData,
        getCurrentContentName   : window.annoPage.getCurrentContentName,
        unlistenWindowLeaveEvent : unlistenWindowLeaveEvent
    })

    // Label input.
    annoUI.labelInput.setup({
        getSelectedAnnotations : window.annoPage.getSelectedAnnotations,
        saveAnnotationText : (id, text) => {
            console.log('saveAnnotationText:', id, text)
            const annotation = window.annoPage.findAnnotationById(id)
            if (annotation) {
                annotation.text = text
                annotation.save()
                annotation.enableViewMode()
            }
        },
        createSpanAnnotation : window.annoPage.createSpan,
        createRelAnnotation : window.annoPage.createRelation
    })

    // Upload button.
    annoUI.uploadButton.setup({
        getCurrentDisplayContentFile : () => {
            return window.annoPage.getCurrentContentFile()
        },
        uploadFinishCallback : (resultText) => {
            console.log('resultText:\n', resultText)
            prepareSearch(resultText)
        }
    })

    // Display a PDF specified via URL query parameter.

    let pdfURL
    let annoURL
    let moveTo
    (location.search || '').replace('?', '').split('&')
        .filter(a => a)
        .forEach(fragment => {
            let [ key, value ] = fragment.split('=')
            if (key && key.toLowerCase() === 'pdf') {
                pdfURL = value
            } else if (key && key.toLowerCase() === 'anno') {
                annoURL = value
            } else if (key && key.toLowerCase() === 'move') {
                moveTo = value
            }
    })

    if (pdfURL) {

        console.log('pdfURL=', pdfURL)

        // Show loading.
        $('#pdfLoading').removeClass('hidden')

        // Load a PDF file.
        loadPDF(pdfURL).then(({ pdf, analyzeResult }) => {

            const pdfName = pdfURL.split('/')[pdfURL.split('/').length - 1]

            // Init viewer.
            window.annoPage.initializeViewer(null)
            // Start application.
            window.annoPage.startViewerApplication()

            window.addEventListener('iframeReady', () => {
                setTimeout(() => {
                    window.annoPage.displayViewer({
                        name    : pdfName,
                        content : pdf
                    })
                }, 500)
            })

            const listenPageRendered = () => {
                $('#pdfLoading').addClass('close')
                setTimeout(function() {
                    $('#pdfLoading').addClass('hidden')
                }, 1000)

                // Load and display annotations, if annoURL is set.
                if (annoURL) {
                    loadExternalAnnoFile(annoURL).then(anno => {
                        publicApi.addAllAnnotations(publicApi.readTOML(anno))

                        // Move to the annotation.
                        if (moveTo) {
                            setTimeout(() => {
                                window.annoPage.scrollToAnnotation(moveTo)
                            }, 500)
                        }
                    })
                }
                window.removeEventListener('pagerendered', listenPageRendered)
            }
            window.addEventListener('pagerendered', listenPageRendered)

            // Set the analyzeResult.
            annoUI.uploadButton.setResult(analyzeResult)

            prepareSearch(analyzeResult)

            // Display upload tab.
            $('a[href="#tab2"]').click()

        }).catch(err => {
            // Hide a loading, and show the error message.
            $('#pdfLoading').addClass('hidden')
            annoUI.ui.alertDialog.show({ message : err })
        })

    } else {

        // If no PDF is specified, display a default PDF file.

        // Init viewer.
        window.annoPage.initializeViewer()
        // Start application.
        window.annoPage.startViewerApplication()

        // Load the default PDF, and save it.
        loadPDF(getDefaultPDFURL()).then(({ pdf, analyzeResult }) => {
            // Set as current.
            window.annoPage.setCurrentContentFile({
                name    : DEFAULT_PDF_NAME,
                content : pdf
            })

            prepareSearch(analyzeResult)
        })
    }

})

/**
 * Load a PDF data from the server.
 */
function loadPDF (url) {
    return new Promise((resolve, reject) => {

        // Load a PDF as ArrayBuffer.
        var xhr = new XMLHttpRequest()
        xhr.open('GET', API_ROOT + '/load_pdf?url=' + window.encodeURIComponent(url), true)
        xhr.responseType = 'json'
        xhr.onload = function () {
            if (this.status === 200) {

                // Error handling.
                if (this.response.status === 'failure') {
                    let error = this.response.err.stderr || this.response.err
                    return reject(error)
                }

                // Get a PDF as arrayBuffer.
                const pdf = Uint8Array.from(atob(this.response.pdf), c => c.charCodeAt(0))
                const analyzeResult = this.response.analyzeResult
                resolve({ pdf, analyzeResult })
            }
        }
        xhr.timeout = 120 * 1000 // 120s
        xhr.ontimeout = function () {
            reject('Failed to load the PDF.')
        }
        xhr.onerror = function(err) {
            reject(err)
        }
        xhr.send()
    })
}

/**
 * Load an annotation file from the server.
 */
function loadExternalAnnoFile (url) {
    return axios.get(`${API_ROOT}/api/load_anno?url=${url}`).then(res => {
        if (res.status !== 200 || res.data.status === 'failure') {
            let reason = ''
            if (res.data.error) {
                reason = '<br>Reason: ' + res.data.error
            }
            annoUI.ui.alertDialog.show({ message : 'Failed to load an anno file. url=' + url + reason})
            return Promise.reject()
        }
        return res.data.anno
    })
}

/**
 * Get the URL of the default PDF.
 */
function getDefaultPDFURL () {
    // e.g. https://paperai.github.io/pdfanno/pdfs/P12-1046.pdf
    const pathnames = location.pathname.split('/')
    const pdfURL = location.protocol + '//' + location.hostname + ':' + location.port + pathnames.slice(0, pathnames.length-1).join('/') + '/pdfs/' + DEFAULT_PDF_NAME
    return pdfURL
}


let pages = []

function prepareSearch(pdfResult) {
    console.log('prepareSearch!!!', pdfResult.length)

    pages = []

    let page
    let body
    let meta
    pdfResult.split('\n').forEach(line => {
        if (page && !line) {
            body += ' '
            meta.push(line)
        } else {
            let [
                pageNumber,
                type,
                char,
                ...others
            ] = line.split('\t')
            pageNumber = parseInt(pageNumber, 10)
            if (!page) {
                page = pageNumber
                body = ''
                meta = []
            } else if (page !== pageNumber) {
                pages.push({
                    body,
                    meta,
                    page
                })
                body = ''
                meta = []
                page = pageNumber
            }
            if (type === 'TEXT') {
                body += char
                meta.push(line)
            }
        }
    })
    pages.push({
        body,
        meta,
        page
    })
    console.log('pages:', pages)

    // Enable search input field.
    $('#searchWord').removeAttr('disabled')
}

window.addEventListener('DOMContentLoaded', () => {

    const DELAY = 500
    let timerId

    $('#searchWord').on('keyup', e => {

        if (timerId) {
            clearTimeout(timerId)
            timerId = null
        }

        timerId = setTimeout(() => {
            doSearch()
        }, DELAY)
    })

    $('.js-search-case-sensitive, .js-search-regexp').on('change', () => {
        doSearch();
    })

    // Re-render the search results.
    window.addEventListener('pagerendered', rerenderSearchResults)


    $('.js-search-prev, .js-search-next').on('click', e => {

        // No action for no results.
        if (searchHighlights.length === 0) {
            return
        }

        // go to next or prev.
        let num = 1
        if ($(e.currentTarget).hasClass('js-search-prev')) {
            num = -1
        }
        searchPosition += num
        if (searchPosition < 0) {
            searchPosition = searchHighlights.length - 1
        } else if (searchPosition >= searchHighlights.length) {
            searchPosition = 0
        }

        highlightSearchResult()
    })
})

function highlightSearchResult() {

    $('.search-current-position').text(searchPosition + 1)

    $('.pdfanno-search-result', iframeWindow.document).removeClass('pdfanno-search-result--highlight')

    const highlight = searchHighlights[searchPosition]
    highlight.$elm.addClass('pdfanno-search-result--highlight')

    console.log(`highlight: index=${searchPosition}, page=${highlight.page}`)

    // Scroll to.
    let pageHeight = window.annoPage.getViewerViewport().height
    let scale = window.annoPage.getViewerViewport().scale
    let _y = (pageHeight + paddingBetweenPages) * (highlight.page - 1) + highlight.top * scale
    _y -= 100
    $('#viewer iframe').contents().find('#viewer').parent()[0].scrollTop = _y

}

function rerenderSearchResults() {

    // No action for no results.
    if (searchHighlights.length === 0) {
        return
    }

    // Remove.
    $('.pdfanno-search-result', iframeWindow.document).remove()

    // Display.
    searchHighlights.forEach((highlight, index) => {
        const $textLayer = $(`.page[data-page-number="${highlight.page}"] .textLayer`, iframeWindow.document)
        $textLayer.append(highlight.$elm)
    })
}

function search({ hay, needle, isCaseSensitive = false, useRegexp = false }) {
    if (!needle) {
        return []
    }
    const SPECIAL_CHARS_REGEX = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g
    const flags = 'g' + (isCaseSensitive === false ? 'i' : '')
    if (useRegexp === false) {
        needle = needle.replace(SPECIAL_CHARS_REGEX, '\\$&')
    }
    let re = new RegExp(needle, flags)
    let positions = []
    let match
    while ((match = re.exec(hay)) != null) {
        positions.push({
            start : match.index,
            end   : match.index + match[0].length
        })
    }
    return positions
}

window.searchPosition = -1
window.searchHighlights = []

function doSearch () {

    // TODO Display hit counts?

    // Check enable.
    if ($('#searchWord').is('[disabled]')) {
        console.log('Search function is not enabled yet.')
        return
    }

    // Remove highlights for search results.
    $('.pdfanno-search-result', iframeWindow.document).remove()
    $('.search-hit').addClass('hidden')

    // Text
    const text = $('#searchWord').val()
    // Case Sensitive
    const isCaseSensitive = $('.js-search-case-sensitive')[0].checked
    // Use Regexp.
    const useRegexp = $('.js-search-regexp')[0].checked

    console.log(`doSearch: text="${text}", caseSensitive=${isCaseSensitive}, regexp=${useRegexp}`)

    // The min length of text for searching.
    const MIN_LEN = 2
    if (text.length < MIN_LEN) {
        return
    }

    // Reset.
    searchPosition = -1
    searchHighlights = []

    pages.forEach(page => {

        // Search.
        const positions = search({ hay : page.body, needle : text, isCaseSensitive, useRegexp })

        // Display highlights.
        if (positions.length > 0) {
            positions.forEach(position => {
                const $textLayer = $(`.page[data-page-number="${page.page}"] .textLayer`, iframeWindow.document)
                const infos = page.meta.slice(position.start, position.end)
                // console.log('infos:', infos)
                let fromX, toX, fromY, toY
                infos.forEach(info => {
                    if (!info) {
                        return
                    }
                    const [ x, y, w, h ] = info.split('\t').slice(3, 7).map(parseFloat)
                    fromX = (fromX === undefined ? x : Math.min(x, fromX))
                    toX = (toX === undefined ? (x + w) : Math.max((x + w), toX))
                    fromY = (fromY === undefined ? y : Math.min(y, fromY))
                    toY = (toY === undefined ? (y + h) : Math.max((y + h), toY))
                })
                const scale = iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.scale
                let $div = $('<div class="pdfanno-search-result"/>')
                $div.css({
                    top    : fromY * scale + 'px',
                    left   : fromX * scale + 'px',
                    width  : (toX - fromX) * scale + 'px',
                    height : (toY - fromY) * scale + 'px'
                })
                $textLayer.append($div)
                // TODO 後で、改行されたものとかにも対応できるようにする（その場合は、rectsが複数）
                const aPosition = [[ fromX, fromY, (toX - fromX), (toY - fromY) ]]
                searchHighlights.push({
                    page           : page.page,
                    top            : fromY,
                    position       : aPosition,
                    $elm           : $div,
                    text
                })
            })
        }
    })


    if (searchHighlights.length > 0) {
        // Init highlight at the current page.
        const currentPage = iframeWindow.PDFViewerApplication.page
        for (let i = 0; i < searchHighlights.length; i++) {
            if (currentPage === searchHighlights[i].page) {
                searchPosition = i
                break
            }
        }
        highlightSearchResult()
    }

    $('.search-hit').removeClass('hidden')
    $('.search-current-position').text(searchPosition + 1)
    $('.search-hit-count').text(searchHighlights.length)
}

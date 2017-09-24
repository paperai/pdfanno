require('file-loader?name=dist/index.html!./index.html')
require('!style-loader!css-loader!./pdfanno.css')

import axios from 'axios'

// UI parts.
import * as annoUI from 'anno-ui'

import { dispatchWindowEvent } from './shared/util'
import { paddingBetweenPages } from './shared/coords'
import { unlistenWindowLeaveEvent } from './page/util/window'
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
function _getY (annotation) {

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
        loadFiles                          : window.annoPage.loadFiles,
        clearAllAnnotations                : window.annoPage.clearAllAnnotations,
        displayCurrentReferenceAnnotations : () => window.annoPage.displayAnnotation(false, false),
        displayCurrentPrimaryAnnotations   : () => window.annoPage.displayAnnotation(true, false),
        getContentFiles                    : () => window.annoPage.contentFiles,
        getAnnoFiles                       : () => window.annoPage.annoFiles,
        closePDFViewer                     : window.annoPage.closePDFViewer
    })

    // PDF dropdown.
    annoUI.contentDropdown.setup({
        initialText            : 'PDF File',
        overrideWarningMessage : 'Are you sure to load another PDF ?',
        contentReloadHandler   : fileName => {

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
        clearPrimaryAnnotations  : window.annoPage.clearAllAnnotations,
        displayPrimaryAnnotation : annoName => window.annoPage.displayAnnotation(true)
    })

    // Reference anno dropdown.
    annoUI.referenceAnnoDropdown.setup({
        displayReferenceAnnotations : annoNames => window.annoPage.displayAnnotation(false)
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
        getAnnotationTOMLString  : window.annoPage.exportData,
        getCurrentContentName    : window.annoPage.getCurrentContentName,
        unlistenWindowLeaveEvent : unlistenWindowLeaveEvent
    })

    // Label input.
    annoUI.labelInput.setup({
        getSelectedAnnotations : window.annoPage.getSelectedAnnotations,
        saveAnnotationText     : (id, text) => {
            console.log('saveAnnotationText:', id, text)
            const annotation = window.annoPage.findAnnotationById(id)
            if (annotation) {
                annotation.text = text
                annotation.save()
                annotation.enableViewMode()
            }
        },
        createSpanAnnotation : window.annoPage.createSpan,
        createRelAnnotation  : window.annoPage.createRelation
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
    let tabIndex
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
            } else if (key && key.toLowerCase() === 'tab') {
                tabIndex = parseInt(value, 10)
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
                setTimeout(function () {
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

    // initial tab.
    if (tabIndex) {
        $(`.nav-tabs a[href="#tab${tabIndex}"]`).click()
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
        xhr.onerror = function (err) {
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
            annoUI.ui.alertDialog.show({ message : 'Failed to load an anno file. url=' + url + reason })
            return Promise.reject()
        }
        return res.data.anno
    })
}

/**
 * Get the URL of the default PDF.
 */
function getDefaultPDFURL () {
    // e.g. https://paperai.github.io:80/pdfanno/pdfs/P12-1046.pdf
    const pathnames = location.pathname.split('/')
    const pdfURL = location.protocol + '//' + location.hostname + ':' + location.port + pathnames.slice(0, pathnames.length - 1).join('/') + '/pdfs/' + DEFAULT_PDF_NAME
    return pdfURL
}

let pages = []

function prepareSearch (pdfResult) {
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
                char
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
    $('#searchWord, .js-dict-match-file').removeAttr('disabled')
}

window.addEventListener('DOMContentLoaded', () => {

    const DELAY = 500
    let timerId

    $('#searchWord').on('keyup', e => {

        // Enter key.
        if (e.keyCode === 13) {
            nextSearchResult()
            return
        }

        if (timerId) {
            clearTimeout(timerId)
            timerId = null
        }

        timerId = setTimeout(() => {
            timerId = null
            window.searchType = 'text'
            doSearch()
        }, DELAY)
    })

    $('.js-search-case-sensitive, .js-search-regexp').on('change', () => {
        window.searchType = 'text'
        doSearch()
    })

    $('.js-search-case-sensitive, .js-search-regexp').on('click', e => {
        $(e.currentTarget).blur()
    })

    $('.js-search-clear').on('click', e => {
        // Clear search.
        $('#searchWord').val('')
        window.searchType = null
        doSearch()
        $(e.currentTarget).blur()
    })

    // Re-render the search results.
    window.addEventListener('pagerendered', rerenderSearchResults)

    $('.js-search-prev, .js-search-next').on('click', e => {

        if (window.searchType !== 'text') {
            return
        }

        // No action for no results.
        if (window.searchHighlights.length === 0) {
            return
        }

        if ($(e.currentTarget).hasClass('js-search-prev')) {
            prevSearchResult()
        } else {
            nextSearchResult()
        }
    })
})

function prevSearchResult () {
    window.searchPosition--
    if (window.searchPosition < 0) {
        window.searchPosition = window.searchHighlights.length - 1
    }
    highlightSearchResult()
}

function nextSearchResult () {
    window.searchPosition++
    if (window.searchPosition >= window.searchHighlights.length) {
        window.searchPosition = 0
    }
    highlightSearchResult()
}

function highlightSearchResult () {

    $('.search-current-position').text(window.searchPosition + 1)

    $('.pdfanno-search-result', window.iframeWindow.document).removeClass('pdfanno-search-result--highlight')

    const highlight = window.searchHighlights[window.searchPosition]
    highlight.$elm.addClass('pdfanno-search-result--highlight')

    console.log(`highlight: index=${window.searchPosition}, page=${highlight.page}`)

    // Scroll to.
    let pageHeight = window.annoPage.getViewerViewport().height
    let scale = window.annoPage.getViewerViewport().scale
    let _y = (pageHeight + paddingBetweenPages) * (highlight.page - 1) + highlight.top * scale
    _y -= 100
    $('#viewer iframe').contents().find('#viewer').parent()[0].scrollTop = _y

}

function rerenderSearchResults () {

    // No action for no results.
    if (window.searchHighlights.length === 0) {
        return
    }

    // Remove.
    $('.pdfanno-search-result', window.iframeWindow.document).remove()

    // Display.
    window.searchHighlights.forEach((highlight, index) => {
        const $textLayer = $(`.page[data-page-number="${highlight.page}"] .textLayer`, window.iframeWindow.document)
        $textLayer.append(highlight.$elm)
    })
}

function search ({ hay, needle, isCaseSensitive = false, useRegexp = false }) {
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

window.searchType = null
window.searchPosition = -1
window.searchHighlights = []

function doSearch ({ query = null } = {}) {

    // Check enable.
    if ($('#searchWord').is('[disabled]')) {
        console.log('Search function is not enabled yet.')
        return
    }

    // Remove highlights for search results.
    $('.pdfanno-search-result', window.iframeWindow.document).remove()
    $('.search-hit').addClass('hidden')
    $('.js-dict-match-cur-pos, .js-dict-match-hit-counts').text('000')

    let text
    let isCaseSensitive
    let useRegexp
    if (window.searchType === 'text') {
        text = $('#searchWord').val()
        isCaseSensitive = $('.js-search-case-sensitive')[0].checked
        useRegexp = $('.js-search-regexp')[0].checked
    } else {
        text = query
        isCaseSensitive = $('.js-dict-match-case-sensitive')[0].checked
        useRegexp = true
    }

    console.log(`doSearch: searchType=${window.searchType} text="${text}", caseSensitive=${isCaseSensitive}, regexp=${useRegexp}`)

    // Reset.
    window.searchPosition = -1
    window.searchHighlights = []

    // The min length of text for searching.
    const MIN_LEN = 2
    if (!text || text.length < MIN_LEN) {
        return
    }

    pages.forEach(page => {

        // Search.
        const positions = search({ hay : page.body, needle : text, isCaseSensitive, useRegexp })

        // Display highlights.
        if (positions.length > 0) {
            positions.forEach(position => {
                const $textLayer = $(`.page[data-page-number="${page.page}"] .textLayer`, window.iframeWindow.document)
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
                const scale = window.iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.scale
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
                window.searchHighlights.push({
                    page     : page.page,
                    top      : fromY,
                    position : aPosition,
                    $elm     : $div,
                    text
                })
            })
        }
    })

    if (window.searchHighlights.length > 0) {
        // Init highlight at the current page.
        const currentPage = window.iframeWindow.PDFViewerApplication.page
        for (let i = 0; i < window.searchHighlights.length; i++) {
            if (currentPage === window.searchHighlights[i].page) {
                window.searchPosition = i
                break
            }
        }
        highlightSearchResult()
    }

    if (window.searchType === 'text') {
        $('.search-hit').removeClass('hidden')
        $('.search-current-position').text(window.searchPosition + 1)
        $('.search-hit-count').text(window.searchHighlights.length)
    } else {
        // Dict matching.
        $('.js-dict-match-cur-pos').text(window.searchPosition + 1)
        $('.js-dict-match-hit-counts').text(window.searchHighlights.length)
    }
}

let dictonaryTexts

/**
 * Dictonary Matching.
 */
window.addEventListener('DOMContentLoaded', () => {

    // Clear prev cache.
    $('.js-dict-match-file :file').on('click', e => {
        $(e.currentTarget).val(null)
    })

    // Load a dictionary for matching.
    $('.js-dict-match-file :file').on('change', e => {

        const files = e.target.files
        if (files.length === 0) {
            annoUI.ui.alertDialog.show({ message : 'Select a file.' })
            return
        }

        const fname = files[0].name
        $('.js-dict-match-file-name').text(fname)

        let fileReader = new FileReader()
        fileReader.onload = ev => {
            const texts = ev.target.result.split('\n').map(t => {
                return t.trim()
            }).filter(t => {
                return t
            })
            if (texts.length === 0) {
                annoUI.ui.alertDialog.show({ message : 'No text is found in the dictionary file.' })
                return
            }
            dictonaryTexts = texts
            searchByDictionary(texts)
        }
        fileReader.readAsText(files[0])
    })

    // Clear search results.
    $('.js-dict-match-clear').on('click', e => {
        window.searchType = null
        doSearch()
        $(e.currentTarget).blur()
    })

    // Go to the prev/next result.
    $('.js-dict-match-prev, .js-dict-match-next').on('click', e => {

        if (window.searchType !== 'dictionary') {
            return
        }

        // No action for no results.
        if (window.searchHighlights.length === 0) {
            return
        }

        // go to next or prev.
        let num = 1
        if ($(e.currentTarget).hasClass('js-dict-match-prev')) {
            num = -1
        }
        window.searchPosition += num
        if (window.searchPosition < 0) {
            window.searchPosition = window.searchHighlights.length - 1
        } else if (window.searchPosition >= window.searchHighlights.length) {
            window.searchPosition = 0
        }

        highlightSearchResult()
    })

    // Set the search behavior.
    $('.js-dict-match-case-sensitive').on('change', () => {
        searchByDictionary(dictonaryTexts)
    })
})

function searchByDictionary (texts = []) {
    console.log('searchByDictionary:', texts)
    window.searchType = 'dictionary'
    const query = texts.join('|')
    doSearch({ query })
}

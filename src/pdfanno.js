require("file-loader?name=dist/index.html!./index.html")
require("!style-loader!css-loader!./pdfanno.css")

import axios from 'axios'
import Fuse from 'fuse.js'

// UI parts.
import * as annoUI from 'anno-ui'

import { dispatchWindowEvent } from './shared/util'
import { convertToExportY, getPageSize, paddingBetweenPages } from './shared/coords'
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
        loadPDF(getDefaultPDFURL()).then(({ pdf }) => {
            // Set as current.
            window.annoPage.setCurrentContentFile({
                name    : DEFAULT_PDF_NAME,
                content : pdf
            })
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


/*
    fuse.js sample.

    http://fusejs.io/
*/
var books = [{
  'title': "Old Man's War",
  'author': 'John Scalzi',
  'tags': ['fiction']
}, {
  'title': 'The Lock Artist',
  'author': 'Steve',
  'tags': ['thriller']
}]
var options = {
  keys: ['author', 'tags']
}
var fuse = new Fuse(books, options)

var result = fuse.search('tion')
console.log('fuse result:', result)







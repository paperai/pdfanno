require('file-loader?name=dist/index.html!./index.html')
require('!style-loader!css-loader!./pdfanno.css')

import URI from 'urijs'

// UI parts.
import * as annoUI from 'anno-ui'

import { dispatchWindowEvent } from './shared/util'
import { unlistenWindowLeaveEvent } from './page/util/window'
import * as publicApi from './page/public'
import * as searchUI from './page/search'
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
publicApi.expose()

/**
 * Annotation functions for a page.
 */
window.annoPage = new PDFAnnoPage()

// Manage ctrlKey (cmdKey on Mac).
window.addEventListener('manageCtrlKey', e => {
    window.annoPage.manageCtrlKey(e.detail)
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

            // Disable search UI.
            $('#searchWord, .js-dict-match-file').attr('disabled', 'disabled')

            // Get the content.
            const content = window.annoPage.getContentFile(fileName)

            // Reset annotations displayed.
            window.annoPage.clearAllAnnotations()

            // Display the PDF on the viewer.
            window.annoPage.displayViewer(content)

            // Upload and analyze the PDF for search.
            annoUI.uploadButton.uploadPDF({
                contentFile     : content,
                successCallback : text => {
                    searchUI.setup(text)
                }
            })
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
        getAnnotationTOMLString : window.annoPage.exportData,
        getCurrentContentName   : window.annoPage.getCurrentContentName,
        didDownloadCallback     : unlistenWindowLeaveEvent
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

                dispatchWindowEvent('annotationUpdated')
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
            searchUI.setup(resultText)
        }
    })

    // Display a PDF specified via URL query parameter.
    const q        = URI(document.URL).query(true)
    const pdfURL   = q.pdf || getDefaultPDFURL()
    const annoURL  = q.anno
    const moveTo   = q.move
    const tabIndex = q.tab && parseInt(q.tab, 10)

    console.log('target PDF :', pdfURL)

    // Show loading.
    showLoader(true)

    // Load a PDF file.
    window.annoPage.loadPDFFromServer(pdfURL).then(({ pdf, analyzeResult }) => {

        // Init viewer.
        window.annoPage.initializeViewer(null)
        // Start application.
        window.annoPage.startViewerApplication()

        window.addEventListener('iframeReady', () => {
            setTimeout(() => {
                window.annoPage.displayViewer({
                    name    : getPDFName(pdfURL),
                    content : pdf
                })
            }, 500)
        })

        const listenPageRendered = () => {
            showLoader(false)

            // Load and display annotations, if annoURL is set.
            if (annoURL) {
                window.annoPage.loadAnnoFileFromServer(annoURL).then(anno => {
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

        // Init search function.
        searchUI.setup(analyzeResult)

    }).catch(err => {
        // Hide a loading, and show the error message.
        showLoader(false)
        const message = 'Failed to analyze the PDF.<br>Reason: ' + err
        annoUI.ui.alertDialog.show({ message })
    })

    // initial tab.
    if (tabIndex) {
        $(`.nav-tabs a[href="#tab${tabIndex}"]`).click()
    }

})

/**
 * Get the URL of the default PDF.
 */
function getDefaultPDFURL () {
    // e.g. https://paperai.github.io:80/pdfanno/pdfs/P12-1046.pdf
    const pathnames = location.pathname.split('/')
    const pdfURL = location.protocol + '//' + location.hostname + ':' + location.port + pathnames.slice(0, pathnames.length - 1).join('/') + '/pdfs/' + DEFAULT_PDF_NAME
    return pdfURL
}

/**
 * Get a PDF name from URL.
 */
function getPDFName (url) {
    const a = url.split('/')
    return a[a.length - 1]
}

/**
 * Show or hide a loding.
 */
function showLoader (display) {
    if (display) {
        $('#pdfLoading').removeClass('close hidden')
    } else {
        $('#pdfLoading').addClass('close')
        setTimeout(function () {
            $('#pdfLoading').addClass('hidden')
        }, 1000)
    }
}

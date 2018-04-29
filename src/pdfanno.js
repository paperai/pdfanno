require('file-loader?name=dist/index.html!./index.html')
require('!style-loader!css-loader!./pdfanno.css')

import URI from 'urijs'

// UI parts.
import * as annoUI from 'anno-ui'

import { dispatchWindowEvent } from './shared/util'
import { unlistenWindowLeaveEvent } from './page/util/window'
import * as publicApi from './page/public'
import * as searchUI from './page/search'
import * as textLayer from './page/textLayer'
import * as pdftxtDownload from './page/pdftxtdownload'
import * as ws from './page/socket'
import PDFAnnoPage from './page/pdf/PDFAnnoPage'
import * as deepscholar from './deepscholar'

/**
 * API root point.
 */
if (process.env.NODE_ENV === 'production') {
  window.API_DOMAIN = 'https://pdfanno.hshindo.com'
  window.API_PATH = '/' + process.env.SERVER_PATH + '/'
  window.API_ROOT = window.API_DOMAIN + window.API_PATH
} else {
  window.API_DOMAIN = 'http://localhost:3000'
  window.API_PATH = '/'
  window.API_ROOT = window.API_DOMAIN + window.API_PATH
}

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
window.addEventListener('DOMContentLoaded', async e => {

  // for DeepScholar.
  if (deepscholar.isTarget()) {
    console.log('for deepscholar.')
    deepscholar.initialize()
  }

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

      dispatchWindowEvent('willChangeContent')

      // Disable UI.
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
          dispatchWindowEvent('didChangeContent')
          searchUI.setup(text)
          textLayer.setup(text)
          window.annoPage.pdftxt = text
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

  // Download anno button.
  annoUI.downloadButton.setup({
    getAnnotationTOMLString : window.annoPage.exportData,
    getCurrentContentName   : () => {
      return window.annoPage.getCurrentContentFile().name
    },
    didDownloadCallback : unlistenWindowLeaveEvent
  })

  // Download pdftxt button.
  pdftxtDownload.setup()

  // Label input.
  annoUI.labelInput.setup({
    getSelectedAnnotations : window.annoPage.getSelectedAnnotations,
    saveAnnotationText     : (id, text) => {
      const annotation = window.annoPage.findAnnotationById(id)
      if (annotation) {
        annotation.text = text
        annotation.save()
        annotation.enableViewMode()
        dispatchWindowEvent('annotationUpdated')
      }
    },
    createSpanAnnotation : window.annoPage.createSpan,
    createRelAnnotation  : window.annoPage.createRelation,
    colorChangeListener  : v => {
      window.iframeWindow.annotationContainer.changeColor(v)
    }
  })

  // Upload button.
  annoUI.uploadButton.setup({
    getCurrentDisplayContentFile : () => {
      return window.annoPage.getCurrentContentFile()
    },
    uploadFinishCallback : (resultText) => {
      searchUI.setup(resultText)
      textLayer.setup(resultText)
      window.annoPage.pdftxt = resultText
    }
  })

  // Display a PDF specified via URL query parameter.
  const q        = URI(document.URL).query(true)
  const pdfURL   = q.pdf || getDefaultPDFURL()
  const annoURL  = q.anno
  const moveTo   = q.move
  const tabIndex = q.tab && parseInt(q.tab, 10)

  // Show loading.
  showLoader(true)

  // Load a PDF file.
  try {

    let { pdf, analyzeResult } = await window.annoPage.loadPDFFromServer(pdfURL)

    // Init viewer.
    window.annoPage.initializeViewer(null)
    // Start application.
    window.annoPage.startViewerApplication()

    setTimeout(() => {
      window.annoPage.displayViewer({
        name    : getPDFName(pdfURL),
        content : pdf
      })
    }, 500)

    const listenPageRendered = async () => {
      showLoader(false)

      // Load and display annotations, if annoURL is set.
      if (annoURL) {
        let anno = await window.annoPage.loadAnnoFileFromServer(annoURL)
        publicApi.addAllAnnotations(publicApi.readTOML(anno))
        // Set colors.
        const colorMap = annoUI.labelInput.getColorMap()
        window.iframeWindow.annotationContainer.setColor(colorMap)
        // Move to the annotation.
        if (moveTo) {
          setTimeout(() => {
            window.annoPage.scrollToAnnotation(moveTo)
          }, 500)
        }
      }
      window.removeEventListener('pagerendered', listenPageRendered)
    }
    window.addEventListener('pagerendered', listenPageRendered)

    // Set the analyzeResult.
    annoUI.uploadButton.setResult(analyzeResult)

    // Init search function.
    searchUI.setup(analyzeResult)

    // Init textLayers.
    textLayer.setup(analyzeResult)
    window.annoPage.pdftxt = analyzeResult

  } catch (err) {

    // Hide a loading, and show the error message.
    showLoader(false)
    const message = 'Failed to analyze the PDF.<br>Reason: ' + err
    annoUI.ui.alertDialog.show({ message })

    // Init viewer.
    window.annoPage.initializeViewer(null)
    // Start application.
    window.annoPage.startViewerApplication()
  }

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
  const pdfURL = location.protocol + '//' + location.hostname + ':' + location.port + pathnames.slice(0, pathnames.length - 1).join('/') + '/pdfs/P12-1046.pdf'
  return pdfURL
}

/**
 * Get a PDF name from URL.
 */
function getPDFName (url) {
  const a = url.split('/')
  return a[a.length - 1]
}
window.getPDFName = getPDFName

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

// UserID.
window.addEventListener('DOMContentLoaded', () => {

  let userId = URI(document.URL).query(true).user_id
  if (!userId) {
    userId = annoUI.util.uuid(5)
  }
  $('#userId').val(userId)
})

// WebSocket.
ws.setup()

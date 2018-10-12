/**
 * Functions for annotations rendered over a PDF file.
 */
require('!style-loader!css-loader!./index.css')
import EventEmitter from 'events'
import * as Utils from '../shared/util'
import {addAnnoLayer} from './src/annotation/layer'

// This is the entry point of window.xxx.
// (setting from webpack.config.js)
import PDFAnnoCore from './src/PDFAnnoCore'
export default PDFAnnoCore

import AnnotationContainer from './src/annotation/container'

window.globalEvent = new EventEmitter()
window.globalEvent.setMaxListeners(0)

// Create an annocation container.
window.annotationContainer = new AnnotationContainer()

// Enable a view mode.
PDFAnnoCore.UI.enableViewMode()

// The event called at page rendered by pdfjs.
window.addEventListener('pagerendered', event => {
  console.log('pagerendered:', event.detail.pageNumber)

  // No action, if the viewer is closed.
  if (!window.PDFView.pdfViewer.getPageView(0)) {
    return
  }

  renderAnno(event.detail.pageNumber)
})

// Adapt to scale change.
window.addEventListener('scalechange', event => {
  console.log('scalechange: page=', window.PDFView.pdfViewer.currentPageNumber)
  // removeAnnoLayer()
  // renderAnno()
})

window.addEventListener('pagechange', event => {
  // console.log('pagechange: page=', window.PDFView.pdfViewer.currentPageNumber)
  if (event.previousPageNumber !== event.pageNumber) {
    console.log('pagechange', event.pageNumber)
  }
})

/*
 * Remove the annotation layer and the temporary rendering layer.
 */
/*
 function removeAnnoLayer () {
  // TODO Remove #annoLayer.
  $('#annoLayer, #annoLayer2').remove()
}
*/

/**
 * Render annotations saved in the storage.
 * @param {Integer} page
 */
function renderAnno (page = null) {

  // console.log('renderAnno: page=', page)

  // No action, if the viewer is closed.
  if (!window.PDFView.pdfViewer.getPageView(0)) {
    return
  }

  // If there is no Annotation layer in this page, create it.
  addAnnoLayer(page)

  // This program supports only when pageRotation == 0
  if (window.PDFView.pageRotation !== 0) {
    return
  }

  page = page || window.PDFView.pdfViewer.currentPageNumber

  // TODO どこで呼ぶべきか、要検討 search と関連する。
  // Utils.dispatchWindowEvent('annotationlayercreated')

  renderAnnotations(page)
}

/**
 * Render all annotations.
 * @param {Integer} page
 */
function renderAnnotations (page) {

  // console.log('renderAnnotations: page=', page)

  window.annotationContainer.getAllAnnotations()
    .filter(a => a.page === page)
    .forEach(a => {
      a.render()
      a.enableViewMode()
    })

  Utils.dispatchWindowEvent('annotationrendered')
}

/**
 * Functions for annotations rendered over a PDF file.
 */
require('!style-loader!css-loader!./index.css')
import EventEmitter from 'events'
import * as Utils from '../shared/util'
import PageStates from './src/render/pageStates'

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

window.addEventListener('documentload', event => {
  console.log('[[documentload]]')
  window.pageStates = new PDFAnnoCore.PageStates()
})

// Adapt to scale change.
window.addEventListener('scalechange', event => {
  console.log('[[scalechange]]:',  'page=' + window.PDFView.pdfViewer.currentPageNumber, 'scale=' + event.scale)
  window.pageStates.clear()
  window.annotationContainer.clearRenderingStates()
})

window.addEventListener('pagechange', event => {
  if (event.previousPageNumber !== event.pageNumber) {
    console.log('[[pagechange]]:', 'page=' + event.pageNumber, 'prev=' + event.previousPageNumber)
    const pages = window.PDFView.pdfViewer._getVisiblePages()
    renderAnno({first : pages.first.id, last : pages.last.id})
  }
})

// The event called at page rendered by pdfjs.
window.addEventListener('pagerendered', event => {
  console.log('[[pagerendered]]:', event.detail)

  if (window.PDFView.pageRotation !== 0) {
    window.pageStates.clear()
    window.annotationContainer.clearRenderingStates()
    return
  }

  renderAnno(event.detail.pageNumber, /* forceRender= */ true)
})

window.addEventListener('pagesloaded', event => {
  console.log('[[pagesloaded]]:', event.detail)
})

/*
window.addEventListener('presentationmodechanged', event => {
  console.log('[[presentationmodechanged]]:', event.active, event.switchInProgress)
})
*/

window.addEventListener('resize', event => {
  console.log('[[resize]]:')
})

/*
window.addEventListener('textlayerrendered', event => {
  console.log('[[textlayerrendered]]:', event.detail)
})
*/

/**
 * Render annotations saved in the storage.
 * @param {Integer} pages
 */
function renderAnno (pages, forceRender = false) {

  console.log('renderAnno:', pages, forceRender)

  // No action, if the viewer is closed.
  if (!window.PDFView.pdfViewer.getPageView(0)) {
    return
  }

  // This program supports only when pageRotation == 0.
  if (window.PDFView.pageRotation !== 0) {
    return
  }

  pages = Utils.parsePageParam(pages)

  for (let page of pages) {
    if (window.pageStates.getState(page) !== PageStates.RENDERED || forceRender) {
      renderAnnotations(page)
    }
  }
}

const renderingOptimize = true

/**
 * Render all annotations.
 * @param {Integer} page
 */
function renderAnnotations (page) {

  // console.log('renderAnnotations: page=', page)
  console.time(`renderAnnotations: page(${page})`)

  // TODO どこで呼ぶべきか、要検討 search と関連する。
  // Utils.dispatchWindowEvent('annotationlayercreated')

  if (renderingOptimize) {
    let spans = window.annotationContainer.getAllAnnotations()
      .filter(a => a.type === 'span' && a.page === page && a.isRenderingInitial())

    // spans.forEach(s => { console.log('span on page', s.page, s.uuid) })

    window.annotationContainer.getAllAnnotations()
      .filter(a => a.type === 'relation')
      .forEach(a => {
        if (a.visible(page)) {
          ;[a._rel1Annotation, a._rel2Annotation]
            .filter(span => spans.indexOf(span) < 0 && span.isRenderingInitial())
            .forEach(span => {
              spans.push(span)
              // console.log('add span', span.page, span.uuid)
            })
        }
      })

    // Render spans.
    spans.forEach(a => {
      a.render()
      a.enableViewMode()
    })

    // Render relations.
    window.annotationContainer.getAllAnnotations()
      .filter(a => a.type === 'relation')
      .forEach(a => {
        if (a.visible(page) && a.isRenderingInitial()) {
          a.render()
          a.enableViewMode()
        }
      })
  } else {
    // Render all annotations.
    // This rendering is time-consuming.
    window.annotationContainer.getAllAnnotations().forEach(a => {
      a.render()
      a.enableViewMode()
    })

    window.pageStates.setState(page, PageStates.RENDERED)
  }

  Utils.dispatchWindowEvent('annotationrendered')

  console.timeEnd(`renderAnnotations: page(${page})`)
}

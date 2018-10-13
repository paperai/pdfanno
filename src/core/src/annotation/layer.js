import * as Constants from '../../../shared/constants'
import * as Utils from '../../../shared/util'

let borderTop = 9
let merginBetweenPages =  1 + 1

/**
 * Add annotation layer.
 * @param {Integer} page
 */
export function addAnnoLayer (page = null) {

  // console.log('addAnnoLayer', page, window.PDFView.pdfViewer.pagesCount)

  if (page === null) {
    for (page = 1; page <= window.PDFView.pdfViewer.pagesCount; page++) {
      addAnnoLayer(page)
    }
  } else {
    // console.log('addAnnoLayer: page=', page)

    const view = window.PDFView.pdfViewer.getPageView(page - 1)
    const $container = Utils.getContainer(page)
    const $annoLayer = Utils.getAnnoLayer(page)

    if (view && $container.length > 0 && $annoLayer.length === 0) {

      let $annoLayer = $('<div>').addClass(Constants.ANNO_LAYER_CLASS_NAME).css({
        width  : `${view.width.toFixed()}px`,
        height : `${(view.height + borderTop + merginBetweenPages).toFixed()}px`
      })

      // console.log('before', Utils.getAnnoLayer(page))
      $container.append($annoLayer)
      // console.log('after', Utils.getAnnoLayer(page))
    }
  }
}

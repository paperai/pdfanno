import * as Constants from '../../../shared/constants'
import * as Utils from '../../../shared/util'
import PageStates from './pageStates'

let borderTop = 9
let merginBetweenPages =  1 + 1

/**
 * Add annotation layer.
 * @param {Integer} pages
 */
export function addAnnoLayer (pages) {

  // console.log('addAnnoLayer', pages)

  pages = Utils.parsePageParam(pages)

  for (let page of pages) {
    if (window.pageStates.getState(page) === PageStates.INITIAL) {
      const view = window.PDFView.pdfViewer.getPageView(page - 1)
      if (view) {
        const container = Utils.getContainer(page)
        if (container) {
          const annoLayer = Utils.getAnnoLayer(page)
          if (!annoLayer) {
            let $annoLayer = $('<div>').addClass(Constants.ANNO_LAYER_CLASS_NAME).css({
              width  : `${parseInt(view.width, 10)}px`,
              height : `${parseInt(view.height, 10) + borderTop + merginBetweenPages}px`
            })
            $(container).append($annoLayer)
            window.pageStates.setState(page, PageStates.LAYERED)
            // console.log('addAnnoLayer append', page)
          }
        } else {
          throw new Error(Constants.PAGE_CONTAINER_ID + page + ' not found')
        }
      }
    }
  }
}

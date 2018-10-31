import * as Utils from '../../../shared/util'

export default class PageStates {
  constructor (npages) {
    this.npages = npages || window.PDFView.pdfViewer.pagesCount
    this.clear()
  }

  clear () {
    this.states = Array(this.npages).fill(PageStates.INITIAL)
  }

  /**
   *
   * @param {Integer} page Page Number
   */
  getState (page) {
    const index = page - 1

    if (index < 0 || index >= this.npages) {
      throw new Error('This exceeds the page limit - ' + page)
    }

    if (this.states[index] !== PageStates.INITIAL) {
      // Check if 'annoLayer' exists
      if (!Utils.getAnnoLayer(page)) {
        // Since idle time has elapsed, 'annoLayer' was deleted
        this.states[index] = PageStates.INITIAL
        window.annotationContainer.clearPage(page)
      }
    }

    return this.states[index]
  }

  /**
   *
   * @param {Integer} page Page Number
   * @param {Integer} state
   */
  setState (page, state) {
    const index = page - 1

    if (index < 0 || index >= this.npages) {
      throw new Error('This exceeds the page limit - ' + page)
    }

    this.states[index] = state
  }
}

// 初期状態
PageStates.INITIAL = 0

// レイヤーを作成済み
PageStates.LAYERED = 1

// annotationのレンダリング済み
PageStates.RENDERED = 2

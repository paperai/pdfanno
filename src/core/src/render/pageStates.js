export default class PageStates {
  constructor (npages) {
    this.npages = npages || window.PDFView.pdfViewer.pagesCount
    this.clear()
  }

  clear () {
    this.states = Array(this.npages).fill(PageStates.INITIAL)
  }

  getState (page) {
    return this.states[--page]
  }

  setState (page, state) {
    this.states[--page] = state
  }
}

// 初期状態
PageStates.INITIAL = 0

// レイヤーを作成済み
PageStates.LAYERED = 1

// annotationのレンダリング済み
PageStates.RENDERED = 2

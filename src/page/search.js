/**
 * Search functions.
 */
import { paddingBetweenPages, nextZIndex } from '../shared/coords'
import { customizeAnalyzeResult, extractMeta } from './util/analyzer'
import { searchUI } from 'anno-ui'

/**
 * The highlights for search.
 */
let searchHighlights = []

/**
 * Setup the search function.
 */
export function setup (analyzeData) {
    searchUI.setup({
        pages                : customizeAnalyzeResult(analyzeData),
        scrollTo             : highlightSearchResult.bind(this), // TODO: 引数としてスクロールすべきヒット文字列位置を得る
        searchResultRenderer : renderHighlight.bind(this),       // TODO: 引数としてpositions(#search() の結果)を受け取る
        resetUIAfter         : resetUI.bind(this)                 // TODO: ハイライトレンダリングに関するリセットを行う。操作系についてはsearchEngind内にて実施
    })
    searchUI.enableSearchUI()
}

/**
 * Get the current highlight.
 */
export function getSearchHighlight () {
    const searchPosition = searchUI.searchPosition()
    if (searchPosition > -1) {
        return searchHighlights[searchPosition]
    }
    return null
}

window.addEventListener('DOMContentLoaded', () => {
    // Re-render the search results.
    window.addEventListener('textlayercreated', rerenderSearchResults)
})

/**
 * Highlight a single search result.
 */
function highlightSearchResult (searchPosition) {
    $('.pdfanno-search-result', window.iframeWindow.document).removeClass('pdfanno-search-result--highlight')

    const highlight = searchHighlights[searchPosition]
    highlight.$elm.addClass('pdfanno-search-result--highlight')

    // Scroll to.
    let pageHeight = window.annoPage.getViewerViewport().height
    let scale = window.annoPage.getViewerViewport().scale
    let _y = (pageHeight + paddingBetweenPages) * (highlight.page - 1) + highlight.top * scale
    _y -= 100
    $('#viewer iframe').contents().find('#viewer').parent()[0].scrollTop = _y

}

/**
 * Render search results.
 */
function rerenderSearchResults () {

    // TODO: これは #resetUI() を呼び出してもよいかも
    // Remove olds.
    $('.pdfanno-search-result', window.iframeWindow.document).remove()

    // Display.
    // TODO 高速化。計測から。jQueryアクセスやappendを改善したら早そう.
    searchHighlights.forEach((highlight, index) => {
        const $textLayer = $(`.page[data-page-number="${highlight.page}"] .textLayer`, window.iframeWindow.document)
        // set the depth.
        highlight.$elm.css('z-index', nextZIndex())
        $textLayer.append(highlight.$elm)
    })

}

/**
 * Reset the UI display.
 * @see anno-ui.searchUI#resetUI()
 */
function resetUI () {
    $('.pdfanno-search-result', window.iframeWindow.document).remove()
    searchHighlights = []
}

/**
 * render search results as highlight.
 */
function renderHighlight (positions, page, searchWord) {
    // Display highlights.
    if (positions.length > 0) {
        positions.forEach(position => {
            const $textLayer = $(`.page[data-page-number="${page.page}"] .textLayer`, window.iframeWindow.document)
            const infos = page.meta.slice(position.start, position.end)
            let fromX, toX, fromY, toY
            infos.forEach(info => {
                if (!info) {
                    return
                }
                const { x, y, w, h } = extractMeta(info)
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
                height : (toY - fromY) * scale + 'px',
                zIndex : nextZIndex()
            })
            $textLayer.append($div)
            // TODO 後で、改行されたものとかにも対応できるようにする（その場合は、rectsが複数）
            const aPosition = [[ fromX, fromY, (toX - fromX), (toY - fromY) ]]
            searchHighlights.push({
                page           : page.page,
                top            : fromY,
                position       : aPosition,
                searchPosition : position,
                $elm           : $div,
                searchWord
            })
        })
    }

    if (searchHighlights.length > 0) {
        // Init highlight at the current page.
        const currentPage = window.iframeWindow.PDFViewerApplication.page
        let found = false
        for (let i = 0; i < searchHighlights.length; i++) {
            if (currentPage === searchHighlights[i].page) {
                searchUI.setSearchPosition(i)
                found = true
                break
            }
        }
        // If there is no result at the current page, set the index 0.
        if (!found) {
            searchUI.setSearchPosition(0)
        }
    }
}

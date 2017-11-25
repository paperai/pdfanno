/**
 * Create text layers which enable users to select texts.
 */
import { customizeAnalyzeResult } from './util/analyzer'

let pages

/**
 * Setup text layers.
 */
export function setup (analyzeData) {
    console.log('textLayer:setup')

    pages = customizeAnalyzeResult(analyzeData)

    // Renew text layers.
    $('.textLayer', window.iframeWindow.document).each(function () {
        const page = $(this).parent('.page').data('page-number')
        createTextLayer(page)
    })

    // Listen pageRendered event.
    window.removeEventListener('pagerendered', listenPageRendered)
    window.addEventListener('pagerendered', listenPageRendered)
}

/**
 * Listen pageRendered event, and create a new text layer.
 */
function listenPageRendered (ev) {
    const page = ev.detail.pageNumber
    console.log('textLayer:pageRendered:', page)
    createTextLayer(page)
}

/**
 * Create a new text layer.
 */
function createTextLayer (page) {

    // TODO: Performance: this function is a little heavy.

    setTimeout(() => {

        console.log('createTextLayer:', page)

        const $textLayer = $(`.page[data-page-number="${page}"] .textLayer`, window.iframeWindow.document)

        // Remove all children.
        $textLayer.html('')

        // Create text div elements.
        const snipets = pages[page - 1].meta.map((info, index) => {

            if (!info) {
                return
            }
            const items = info.split('\t')
            const text = items[2]
            const [ x, y, w, h ] = items.slice(3, 7).map(parseFloat)
            const scale = window.iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.scale
            const $div = $('<div class="pdfanno-text-layer"/>').css({
                top        : y * scale + 'px',
                left       : x * scale + 'px',
                width      : w * scale + 'px',
                height     : h * scale + 'px',
                fontSize   : `${h * 0.85}px`,
                lineHeight : h * scale + 'px',
                textAlign  : 'center'
            })
            .attr('data-page', page)
            .attr('data-index', index)
            .text(text)
            return $div[0].outerHTML
        })
        $textLayer.append(snipets.join(''))

    }, window.iframeWindow.TEXT_LAYER_RENDER_DELAY + 300)
}

// TODO a little tricky.
window.getText = function (page, startIndex, endIndex) {
    const infos = pages[page - 1].meta.slice(startIndex, endIndex + 1)
    const texts = infos.map(info => {
        if (!info) {
            return ' '
        } else {
            return info.split('\t')[2]
        }
    })
    const text = texts.join('')

    // Text position.
    const beforeCount = pages.slice(0, page - 1)
            .reduce((v, page) => v.concat(page.meta), [])
            .filter(info => info).length
    const start1 = pages[page - 1].meta.slice(0, startIndex + 1).filter(info => info).length
    const start2 = pages[page - 1].meta.slice(0, endIndex + 1).filter(info => info).length
    const textRange = [ (beforeCount + start1), (beforeCount + start2) ]
    // Return.
    return { text, textRange }
}

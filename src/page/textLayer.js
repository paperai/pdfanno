
let pages

/**
 * Setup text layers.
 */
export function setup (analyzeData) {
    console.log('textLayer:setup')

    // TODO Refactoring: same at page/search.js
    pages = []
    let page
    let body
    let meta
    analyzeData.split('\n').forEach(line => {
        if (page && !line) {
            body += ' '
            meta.push(line)
        } else {
            let [
                pageNumber,
                type,
                char
            ] = line.split('\t')
            pageNumber = parseInt(pageNumber, 10)
            if (!page) {
                page = pageNumber
                body = ''
                meta = []
            } else if (page !== pageNumber) {
                pages.push({
                    body,
                    meta,
                    page
                })
                body = ''
                meta = []
                page = pageNumber
            }
            if (type === 'TEXT') {
                body += char
                meta.push(line)
            }
        }
    })
    pages.push({
        body,
        meta,
        page
    })
    console.log('textLayer:pages:', pages)

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
    setTimeout(() => {

        console.log('createTextLayer:', page)

        const $textLayer = $(`.page[data-page-number="${page}"] .textLayer`, window.iframeWindow.document)
        console.log('$textLayer:', $textLayer)

        // Remove all children.
        $textLayer.html('')

        // Create text div elements.
        const snipets = pages[page - 1].meta.map(info => {
            if (!info) {
                return
            }
            const items = info.split('\t')
            const text = items[2]
            const [ x, y, w, h ] = items.slice(3, 7).map(parseFloat)
            const scale = window.iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.scale
            const $div = $('<div class="pdfanno-text-layer"/>').css({
                top      : y * scale + 'px',
                left     : x * scale + 'px',
                width    : w * scale + 'px',
                height   : h * scale + 'px',
                fontSize : `${h * 0.9}px`
            }).text(text)
            return $div[0].outerHTML
        })
        $textLayer.append(snipets.join(''))

    }, window.iframeWindow.TEXT_LAYER_RENDER_DELAY + 300)
}


export const BORDER_COLOR = '#00BFFF'

/**
 * Adjust scale from normalized scale (100%) to rendered scale.
 *
 * @param {SVGElement} svg The SVG to gather metadata from
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled up
 */
export function scaleUp (svg, rect) {

    if (arguments.length === 1) {
        rect = svg
        svg = getSVGLayer()
    }

    let result = {}
    const viewport = window.PDFView.pdfViewer.getPageView(0).viewport

    Object.keys(rect).forEach((key) => {
        result[key] = rect[key] * viewport.scale
    })

    return result
}

/**
 * Adjust scale from rendered scale to a normalized scale (100%).
 *
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled down
 */
export function scaleDown (rect) {

    // TODO for old style:  scaleDown(svg, rect)
    if (arguments.length === 2) {
        rect = arguments[1]
    }

    let result = {}
    const viewport = window.PDFView.pdfViewer.getPageView(0).viewport
    Object.keys(rect).forEach((key) => {
        result[key] = rect[key] / viewport.scale
    })

    return result
}

/**
 * Disable all text layers.
 */
export function disableTextlayer () {
    $('body').addClass('disable-text-layer')
}

/**
 * Enable all text layers.
 */
export function enableTextlayer () {
    $('body').removeClass('disable-text-layer')
}

export function getXY (e) {
    let rect2 = $('#annoLayer2')[0].getBoundingClientRect()
    let y = e.clientY + $('#annoLayer2').scrollTop() - rect2.top
    let x = e.clientX - rect2.left
    return { x, y }
}

export function getSVGLayer () {
    return document.getElementById('annoLayer')
}

export function getTmpLayer () {
    return document.getElementById('tmpLayer')
}

export function getCurrentPage (e) {

    let { x, y } = getXY(e)

    let scrollTop = $('#annoLayer2')[0].getBoundingClientRect().top
    let scrollLeft = $('#annoLayer2')[0].getBoundingClientRect().left

    let elements = document.querySelectorAll('.canvasWrapper')

    for (let i = 0, l = elements.length; i < l; i++) {
        let el = elements[i]
        let rect = el.getBoundingClientRect()
        let minX = rect.left - scrollLeft
        let maxX = rect.right - scrollLeft
        let minY = rect.top - scrollTop
        let maxY = rect.bottom - scrollTop

        if (minX <= x && x <= maxX && minY <= y && y <= maxY) {
            let page = parseInt(el.parentNode.id.replace('pageContainer', ''))
            return { page, minX, maxX, minY, maxY }
        }
    }

    console.log('notfound ><...')
    return null
}

export function getAnnoLayerBoundingRect () {
    return $('#annoLayer2')[0].getBoundingClientRect()
}

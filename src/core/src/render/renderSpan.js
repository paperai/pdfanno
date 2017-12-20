import { renderKnob } from './renderKnob'

/**
 * Create a Span element.
 * @param {SpanAnnotation} a - span annotation.
 * @return {HTMLElement} a html element describing a span annotation.
 */
export function renderSpan (a) {

    const readOnly = a.readOnly

    const color = a.color || '#FF0'

    const $base = $('<div class="anno-span"/>')
        .css('zIndex', a.zIndex || 10)

    a.rectangles.forEach(r => {
        $base.append(createRect(r, color, readOnly))
    })

    $base.append(renderKnob({
        x : a.rectangles[0].x,
        y : a.rectangles[0].y
    }))

    return $base[0]
}

function createRect (r, color, readOnly) {

    const rgba = hex2rgba(color, 0.4)

    return $('<div class="anno-span__area"/>').css({
        top             : r.y + 'px',
        left            : r.x + 'px',
        width           : r.width + 'px',
        height          : r.height + 'px',
        backgroundColor : rgba
    })
}

/**
 * Change color definition style from hex to rgba.
 */
function hex2rgba (hex, alpha = 1) {

    // long version
    let r = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
    let c = null
    if (r) {
        c = r.slice(1, 4).map(function (x) { return parseInt(x, 16) })
    }
    // short version
    r = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
    if (r) {
        c = r.slice(1, 4).map(function (x) { return 0x11 * parseInt(x, 16) })
    }
    if (!c) {
        return hex
    }
    return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`
}

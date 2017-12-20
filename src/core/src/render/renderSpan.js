import { renderKnob } from './renderKnob'
import { hex2rgba } from '../utils/color'

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

    if (readOnly) {
        return $('<div class="anno-span__border"/>').css({
            top         : r.y + 'px',
            left        : r.x + 'px',
            width       : r.width + 'px',
            height      : r.height + 'px',
            borderColor : color
        })

    } else {

        const rgba = hex2rgba(color, 0.4)

        return $('<div class="anno-span__area"/>').css({
            top             : r.y + 'px',
            left            : r.x + 'px',
            width           : r.width + 'px',
            height          : r.height + 'px',
            backgroundColor : rgba
        })
    }
}

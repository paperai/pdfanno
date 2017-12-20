import { renderKnob } from './renderKnob'

/**
 * Create a Rect element.
 * @param {RectAnnotation} a - rect annotation.
 */
export function renderRect (a) {

    let color = a.color || '#f00'

    const $base = $('<div class="anno-rect-base"/>')

    $base.append($('<div class="anno-rect"/>').css({
        top    : `${a.y}px`,
        left   : `${a.x}px`,
        width  : `${a.width}px`,
        height : `${a.height}px`,
        border : `1px solid ${color}`
    }))

    $base.append(renderKnob(a))

    return $base[0]
}

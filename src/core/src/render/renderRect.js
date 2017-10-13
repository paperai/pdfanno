import { renderCircle } from './renderCircle'

/**
 * Create a Rect element.
 * @param {RectAnnotation} a - rect annotation.
 */
export function renderRect (a) {

    let color = a.color || '#f00'

    const $base = $('<div/>').css({
        position   : 'absolute',
        top        : 0,
        left       : 0,
        visibility : 'visible'
    })

    $base.append($('<div/>').css({
        position : 'absolute',
        top      : `${a.y}px`,
        left     : `${a.x}px`,
        width    : `${a.width}px`,
        height   : `${a.height}px`,
        border   : `1px solid ${color}`
    }).addClass('anno-rect'))

    $base.append(renderCircle({
        x    : a.x,
        y    : a.y
    }))

    return $base[0]
}

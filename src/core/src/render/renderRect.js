import setAttributes from '../utils/setAttributes'
import renderCircle, { DEFAULT_RADIUS, renderCircle2 } from './renderCircle'

/**
 * Create SVGRectElements from an annotation definition.
 * This is used for anntations of type `area`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement|SVGRectElement} A group of all rects to be rendered
 */
export function renderRect (a, svg) {
    let color = a.color || '#f00'

    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('read-only', a.readOnly === true)
    group.style.visibility = 'visible'

    let rect = createRect(a)
    setAttributes(rect, {
        stroke      : color,
        strokeWidth : 1,
        fill        : 'none',
        class       : 'anno-rect'
    })
    group.appendChild(rect)

    let circle = renderCircle({
        x    : a.x,
        y    : a.y - DEFAULT_RADIUS - 2,
        type : 'boundingCircle'
    })
    group.appendChild(circle)

    return group
}

export function renderRect2 (a) {
    let color = a.color || '#f00'

    const $base = $('<div/>').css({  // TODO CSS.
        position        : 'absolute',
        top             : a.y,
        left            : a.y,
        width           : a.width,
        height          : a.height,
        visibility      : 'visible'
    }).addClass('anno-rect')

    $base.append($('<div/>').css({  // TODO CSS.
        width    : '100%',
        height   : '100%',
        opacity         : 0.2,
        border          : '1px solid yellow',
        backgroundColor : color
    }).addClass('anno-rect__area'))

    $base.append(renderCircle2())


    // TODO ここから実装する.




    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('read-only', a.readOnly === true)
    group.style.visibility = 'visible'

    let rect = createRect(a)
    setAttributes(rect, {
        stroke      : color,
        strokeWidth : 1,
        fill        : 'none',
        class       : 'anno-rect'
    })
    group.appendChild(rect)

    let circle = renderCircle({
        x    : a.x,
        y    : a.y - DEFAULT_RADIUS - 2,
        type : 'boundingCircle'
    })
    group.appendChild(circle)

    return group
}

function createRect (r) {
    let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    setAttributes(rect, {
        x      : r.x,
        y      : r.y,
        width  : r.width,
        height : r.height
    })

    return rect
}

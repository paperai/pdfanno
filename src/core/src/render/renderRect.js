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

// TODO fix the name.
export function renderRect2 (a) {
    let color = a.color || '#f00'

    const $base = $('<div/>').css({
        position   : 'absolute',
        top        : 0,
        left       : 0,
        visibility : 'visible'
    })


    $base.append(createRect2(a))

    $base.append(renderCircle2({
        x    : a.x,
        y    : a.y,
        type : 'boundingCircle'
    }))

    return $base[0]


    // let group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // group.setAttribute('read-only', a.readOnly === true)
    // group.style.visibility = 'visible'

    // let rect = createRect(a)
    // setAttributes(rect, {
    //     stroke      : color,
    //     strokeWidth : 1,
    //     fill        : 'none',
    //     class       : 'anno-rect'
    // })
    // group.appendChild(rect)

    // let circle = renderCircle({
    //     x    : a.x,
    //     y    : a.y - DEFAULT_RADIUS - 2,
    //     type : 'boundingCircle'
    // })
    // group.appendChild(circle)

    // return group
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


function createRect2 (r) {

    const rect = $('<div/>').css({
        position : 'absolute',
        top      : `${r.y}px`,
        left     : `${r.x}px`,
        width    : `${r.width}px`,
        height   : `${r.height}px`,
        border   : '1px solid red'
    }).addClass('anno-rect')

    // let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    // setAttributes(rect, {
    //     x      : r.x,
    //     y      : r.y,
    //     width  : r.width,
    //     height : r.height
    // })

    return rect
}

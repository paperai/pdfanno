import setAttributes from '../utils/setAttributes'
import { DEFAULT_RADIUS } from './renderKnob'
import { findBezierControlPoint } from '../utils/relation.js'

let secondaryColor = ['green', 'blue', 'purple']

/**
 * Create SVGGElements from an annotation definition.
 * This is used for anntations of type `relation`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement} A group of a relation to be rendered
 */
export function renderRelation (a) {
    let color = a.color
    if (!color) {
        if (a.readOnly) {
            color = secondaryColor[a.seq % secondaryColor.length]
        } else {
            color = '#F00'
        }
    }

    // Adjust the start/end points.
    let theta = Math.atan((a.y1 - a.y2) / (a.x1 - a.x2))
    let sign = (a.x1 < a.x2 ? 1 : -1)
    a.x1 += DEFAULT_RADIUS * Math.cos(theta) * sign
    a.x2 -= DEFAULT_RADIUS * Math.cos(theta) * sign
    a.y1 += DEFAULT_RADIUS * Math.sin(theta) * sign
    a.y2 -= DEFAULT_RADIUS * Math.sin(theta) * sign

    let top    = Math.min(a.y1, a.y2)
    let left   = Math.min(a.x1, a.x2)
    let width  = Math.abs(a.x1 - a.x2)
    let height = Math.abs(a.y1 - a.y2)

    const [ $svg, margin ] = createSVGElement(top, left, width, height)

    // Transform coords.
    a.x1 = a.x1 - left + margin
    a.x2 = a.x2 - left + margin
    a.y1 = a.y1 - top + margin
    a.y2 = a.y2 - top + margin

    // <svg viewBox="0 0 200 200">
    //     <marker id="m_ar" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="strokeWidth" preserveAspectRatio="none" markerWidth="2" markerHeight="3" orient="auto-start-reverse">
    //         <polygon points="0,0 0,10 10,5" fill="red" id="ms"/>
    //     </marker>
    //     <path d="M50,50 h100" fill="none" stroke="black" stroke-width="10" marker-start="url(#m_ar)" marker-end="url(#m_ar)"/>
    // </svg>

    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    setAttributes(group, {
        fill        : color,
        stroke      : color,
        // TODO no need?
        'data-rel1' : a.rel1,
        'data-rel2' : a.rel2,
        'data-text' : a.text
    })
    group.style.visibility = 'visible'
    group.setAttribute('read-only', a.readOnly === true)

    $svg[0].appendChild(group)

    let marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
    setAttributes(marker, {
        viewBox      : '0 0 10 10',
        markerWidth  : 2,
        markerHeight : 3,
        fill         : color,
        id           : 'relationhead',
        orient       : 'auto-start-reverse'
    })
    marker.setAttribute('refX', 5)
    marker.setAttribute('refY', 5)
    group.appendChild(marker)

    let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    setAttributes(polygon, {
        points : '0,0 0,10 10,5'
    })
    marker.appendChild(polygon)

    // Find Control points.
    let control = findBezierControlPoint(a.x1, a.y1, a.x2, a.y2)

    // Create Outline.
    let outline = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    setAttributes(outline, {
        d     : `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
        class : 'anno-relation-outline'
    })
    group.appendChild(outline)

    /*
        <path d="M 25 25 Q 175 25 175 175" stroke="blue" fill="none"/>
    */
    let relation = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    setAttributes(relation, {
        d           : `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
        stroke      : color,
        strokeWidth : 1,
        fill        : 'none',
        class       : 'anno-relation'
    })

    // Triangle for the end point.
    if (a.direction === 'one-way' || a.direction === 'two-way') {
        relation.setAttribute('marker-end', 'url(#relationhead)')
    }

    // Triangle for the start point.
    if (a.direction === 'two-way') {
        relation.setAttribute('marker-start', 'url(#relationhead)')
    }

    // if (id) {
    //     setAttributes(relation, { id : id })
    // }

    group.appendChild(relation)

    const $base = $('<div/>').css({
        position   : 'absolute',
        top        : 0,
        left       : 0,
        visibility : 'visible'
    }).addClass('anno-relation')
    $base.append($svg)

    return $base[0]
}

function createSVGElement (top, left, width, height) {

    // the margin for rendering an arrow curve.
    const margin = 50

    // Add an annotation layer.
    let $svg = $('<svg class=""/>').css({ // I don't know why, but empty class is need.
        position   : 'absolute',
        top        : `${top - margin}px`,
        left       : `${left - margin}px`,
        width      : `${width + margin * 2}px`,
        height     : `${height + margin * 2}px`,
        visibility : 'hidden',
        'z-index'  : 2
    }).attr({
        x : 0,
        y : 0
    })

    return [ $svg, margin ]
}

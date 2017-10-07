import setAttributes from '../utils/setAttributes'

export const DEFAULT_RADIUS = 7

/**
 * Create a bounding circle.
 * @param {Object} a - the position for rendering.
 */
export function renderCircle (a) {

    const radius = a.r || DEFAULT_RADIUS

    // TODO Use this.
    // let {x, y} = adjustPoint(a.x, a.y, a.r || DEFAULT_RADIUS)

    const circle = $('<div/>').css({
        position        : 'absolute',
        top             : `${a.y - (radius + 2)}px`,
        left            : a.x + 'px',
        backgroundColor : 'blue',
        width           : radius + 'px',
        height          : radius + 'px',
        borderRadius    : '50%'
    }).attr('type', a.type).addClass('anno-circle') // need to add type ?

    return circle
}

// TODO Use this.
function adjustPoint (x, y, radius) {
    // Avoid overlapping.
    let circles = document.querySelectorAll('svg [type="boundingCircle"]')

    while (true) {
        let good = true
        Array.prototype.forEach.call(circles, circle => {
            let x1 = parseFloat(circle.getAttribute('cx'))
            let y1 = parseFloat(circle.getAttribute('cy'))
            let r1 = parseFloat(circle.getAttribute('r'))
            let distance1 = Math.pow(x - x1, 2) + Math.pow(y - y1, 2)
            let distance2 = Math.pow(radius + r1, 2)
            if (distance1 < distance2) {
                good = false
            }
        })

        if (good) {
            break
        }
        y -= 1
    }

    return {x, y}
}

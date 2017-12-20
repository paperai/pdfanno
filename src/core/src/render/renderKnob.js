
/**
 * Circle radius.
 */
export const DEFAULT_RADIUS = 7

/**
 * Create a bounding circle.
 * @param {Object} the position for rendering.
 */
export function renderKnob ({ x, y }) {

    // Adjust the position.
    [x, y] = adjustPoint(x, (y - (DEFAULT_RADIUS + 2)), DEFAULT_RADIUS)

    const circle = $('<div class="anno-knob"/>').css({
        top    : `${y}px`,
        left   : `${x}px`,
        width  : DEFAULT_RADIUS + 'px',
        height : DEFAULT_RADIUS + 'px'
    })

    return circle
}

/**
 * Adjust the circle position not overlay anothers.
 */
function adjustPoint (x, y, radius) {

    const $circles = $('.anno-knob')

    while (true) {
        let good = true
        $circles.each(function () {
            const $this = $(this)
            const x1 = parseInt($this.css('left'))
            const y1 = parseInt($this.css('top'))
            const distance1 = Math.pow(x - x1, 2) + Math.pow(y - y1, 2)
            const distance2 = Math.pow(radius, 2)
            if (distance1 < distance2) {
                good = false
            }
        })
        if (good) {
            break
        }
        y -= 1
    }
    return [x, y]
}

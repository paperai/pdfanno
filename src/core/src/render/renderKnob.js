import * as Constants from '../../../shared/constants'

/**
 * Circle radius.
 */
export const DEFAULT_RADIUS = 7

/**
 * Create a bounding circle.
 * @param {Object} the data for rendering.
 */
export function renderKnob ({ page, x, y, readOnly }) {

  // Adjust the position.
  [x, y] = adjustPoint(page, x, (y - (DEFAULT_RADIUS + 2)), DEFAULT_RADIUS)

  // Set the CSS class.
  let cssClass = 'anno-knob'
  if (readOnly) {
    cssClass += ' is-readonly'
  }

  // Create a knob.
  return $(`<div class="${cssClass}"/>`).css({
    top    : `${y}px`,
    left   : `${x}px`,
    width  : DEFAULT_RADIUS + 'px',
    height : DEFAULT_RADIUS + 'px'
  })
}

/**
 * Adjust the circle position not overlay anothers.
 */
function adjustPoint (page, x, y, radius) {

  // Get knobs on current page.
  const $circles = $('#' + Constants.PAGE_CONTAINER_ID + page + ' .anno-knob')

  // Find a position where all knobs are not placed at.
  while (true) {
    let good = true
    $circles.each(function () {
      const $this = $(this)
      // Forced reflow is a likely performance bottleneck
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

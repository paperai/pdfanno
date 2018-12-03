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

  const $base = $('<div class="anno-span"/>').css('zIndex', a.zIndex || 10)

  if (!a.page) {
    if (a.rectangles.length > 0) {
      a.page = a.rectangles[0].page
    }
  }

  const rectangles = a.rectangles.map(r => {
    return {
      x      : r.x || r.left,
      y      : (r.y || r.top),
      width  : r.width || r.right - r.left,
      height : r.height || r.bottom - r.top
    }
  }).filter(r => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)

  rectangles.forEach(r => {
    $base.append(createRect(a, r, color, readOnly))
  })

  if (a.knob) {
    $base.append(renderKnob({
      page : a.page,
      x    : rectangles[0].x,
      y    : rectangles[0].y,
      readOnly
    }))
  }

  return $base[0]
}

/**
 *
 * @param {RectAnnotation} a
 * @param {Array} r
 * @param {String} color
 * @param {Boolean} readOnly
 */
function createRect (a, r, color, readOnly) {

  let className = readOnly ? 'anno-span__border' : 'anno-span__area'
  if (a.border === false) {
    className += ' no-border'
  }

  return $(`<div class="${className}"/>`).css({
    top             : r.y + 'px',
    left            : r.x + 'px',
    width           : r.width + 'px',
    height          : r.height + 'px',
    backgroundColor : hex2rgba(color, 0.4),
    borderColor     : color
  })
}

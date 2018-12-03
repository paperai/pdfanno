import { renderKnob } from './renderKnob'

/**
 * Create a rect annotation.
 * @param {RectAnnotation} a - rect annotation.
 */
export function renderRect (a) {

  const color = a.color || '#FF0000'
  const $base = $('<div class="anno-rect"/>')

  $base.append($('<div class="anno-rect__area"/>').css({
    top    : `${a.y}px`,
    left   : `${a.x}px`,
    width  : `${a.width}px`,
    height : `${a.height}px`,
    border : `1px solid ${color}`
  }))

  if (a.knob) {
    $base.append(renderKnob({
      page     : a.page,
      x        : a.x,
      y        : a.y,
      readOnly : a.readOnly
    }))
  }

  return $base[0]
}

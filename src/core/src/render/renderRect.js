import { renderKnob } from './renderKnob'
import { hex2rgba } from '../utils/color'

/**
 * Create a rect annotation.
 * @param {RectAnnotation} a - rect annotation.
 */
export function renderRect (a) {

  let color = a.color || '#FF0000'

  let paddingTop = 9
  const scale = window.PDFView.pdfViewer.getPageView(0).viewport.scale
  const marginBetweenPages =  1
  let pageTopY = $('#pageContainer' + a.page).position().top / scale + paddingTop + marginBetweenPages

  const $base = $('<div class="anno-rect-base"/>')

  $base.append($('<div class="anno-rect"/>').css({
    top    : `${a.y + pageTopY}px`,
    left   : `${a.x}px`,
    width  : `${a.width}px`,
    height : `${a.height}px`,
    border : `1px solid ${color}`
  }))

  if (a.knob) {
    $base.append(renderKnob(a))
  }

  return $base[0]
}

import { renderKnob } from './renderKnob'

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

  const x = a.x
  const y = a.y + pageTopY

  const $base = $('<div class="anno-rect-base"/>')

  $base.append($('<div class="anno-rect"/>').css({
    top    : `${y}px`,
    left   : `${x}px`,
    width  : `${a.width}px`,
    height : `${a.height}px`,
    border : `1px solid ${color}`
  }))

  if (a.knob) {
    $base.append(renderKnob({ x, y, readOnly : a.readOnly }))
  }

  return $base[0]
}

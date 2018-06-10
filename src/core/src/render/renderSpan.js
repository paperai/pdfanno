import { renderKnob } from './renderKnob'
import { hex2rgba } from '../utils/color'
import ANNO_VERSION from '../version'

console.log('ANNO_VERSION:', ANNO_VERSION)

/**
 * Create a Span element.
 * @param {SpanAnnotation} a - span annotation.
 * @return {HTMLElement} a html element describing a span annotation.
 */
export function renderSpan (a) {

  const readOnly = a.readOnly

  const color = a.color || '#FF0'

  const $base = $('<div class="anno-span"/>')
    .css('zIndex', a.zIndex || 10)


  let paddingTop = 9
  let pageHeight = window.PDFView.pdfViewer.getPageView(0).viewport.viewBox[3]
  let merginBetweenPages = 1
  let pageTopY = paddingTop + (paddingTop + pageHeight + merginBetweenPages) * (a.page - 1)

  const rectangles = a.rectangles.map(r => {
    return {
      x      : r.x || r.left,
      y      : (r.y || r.top) + pageTopY,
      width  : r.width || r.right - r.left,
      height : r.height || r.bottom - r.top
    }
  }).filter(r => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)

  rectangles.forEach(r => {
    $base.append(createRect(a, r, color, readOnly))
  })

  if (a.knob) {
    $base.append(renderKnob({
      x : rectangles[0].x,
      y : rectangles[0].y,
      readOnly
    }))
  }

  return $base[0]
}

function createRect (a, r, color, readOnly) {

  if (readOnly) {
    return $('<div class="anno-span__border"/>').css({
      top         : r.y + 'px',
      left        : r.x + 'px',
      width       : r.width + 'px',
      height      : r.height + 'px',
      borderColor : color
    })

  } else {

    const rgba = hex2rgba(color, 0.4)
    const borderCss = (a.border === false ? 'no-border' : '')
    
    return $(`<div class="anno-span__area ${borderCss}"/>`).css({
      top             : r.y + 'px',
      left            : r.x + 'px',
      width           : r.width + 'px',
      height          : r.height + 'px',
      backgroundColor : rgba
    })
  }
}

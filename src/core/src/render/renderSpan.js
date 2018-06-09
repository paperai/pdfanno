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

  const $base = $('<div class="anno-span"/>')
    .css('zIndex', a.zIndex || 10)


  let paddingTop = 9
  let pageHeight = window.PDFView.pdfViewer.getPageView(0).viewport.viewBox[3]
  let merginBetweenPages = 1
  let pageTopY = paddingTop + (paddingTop + pageHeight + merginBetweenPages) * (a.page - 1)

  const rectangles = a.rectangles.map(r => {
    return {
      x      : r.left,
      y      : r.top + pageTopY,
      width  : r.width || r.right - r.left,
      height : r.height || r.bottom - r.top
    }
  }).filter(r => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)

  console.log('pageTopY:', a.page, pageTopY, rectangles, a.rectangles.map(r => {
    return {
      x      : r.left,
      y      : r.top + pageTopY,
      width  : r.width || r.right - r.left,
      height : r.height || r.bottom - r.top
    }
  }))

  rectangles.forEach(r => {
    $base.append(createRect(r, color, readOnly))
  })

  // a.rectangles.forEach(r => {
  //   $base.append(createRect(r, color, readOnly))
  // })

  if (a.knob) {
    $base.append(renderKnob({
      // x : a.rectangles[0].x,
      // y : a.rectangles[0].y,
      x : rectangles[0].x,
      y : rectangles[0].y,
      readOnly
    }))
  }

  return $base[0]
}

function createRect (r, color, readOnly) {

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

    return $('<div class="anno-span__area"/>').css({
      top             : r.y + 'px',
      left            : r.x + 'px',
      width           : r.width + 'px',
      height          : r.height + 'px',
      backgroundColor : rgba
    })
  }
}

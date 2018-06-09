
export const BORDER_COLOR = '#00BFFF'

/**
 * Adjust scale from normalized scale (100%) to rendered scale.
 *
 * @param {SVGElement} svg The SVG to gather metadata from
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled up
 */
export function scaleUp (svg, rect) {

  if (arguments.length === 1) {
    rect = svg
    svg = getSVGLayer()
  }

  let result = {}
  const viewport = window.PDFView.pdfViewer.getPageView(0).viewport

  Object.keys(rect).forEach((key) => {
    result[key] = rect[key] * viewport.scale
  })

  return result
}

/**
 * Adjust scale from rendered scale to a normalized scale (100%).
 *
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled down
 */
export function scaleDown (rect) {

  // TODO for old style:  scaleDown(svg, rect)
  if (arguments.length === 2) {
    rect = arguments[1]
  }

  let result = {}
  const viewport = window.PDFView.pdfViewer.getPageView(0).viewport
  Object.keys(rect).forEach((key) => {
    result[key] = rect[key] / viewport.scale
  })

  return result
}

/**
 * Disable all text layers.
 */
export function disableTextlayer () {
  $('body').addClass('disable-text-layer')
}

/**
 * Enable all text layers.
 */
export function enableTextlayer () {
  $('body').removeClass('disable-text-layer')
}

export function getXY (e) {
  let rect2 = $('#annoLayer2')[0].getBoundingClientRect()
  let y = e.clientY + $('#annoLayer2').scrollTop() - rect2.top
  let x = e.clientX - rect2.left
  return { x, y }
}

export function getSVGLayer () {
  return document.getElementById('annoLayer')
}

export function getCurrentPage (y) {

  let pageHeight = $('.canvasWrapper').height()
  let pageMargin = parseFloat($('#pageContainer1').css('borderTopWidth'))
  let page = $('.page').length


  for (let i = 0; i < page; i++) {
    let minY = pageMargin + (pageHeight + pageMargin) * i
    let maxY = minY + pageHeight

    if (minY <= y && y <= maxY) {
      return { page : (i + 1), minY, maxY }
    }
  }

  console.log('notfound ><...', y)
  return null
}

export function getAnnoLayerBoundingRect () {
  return $('#annoLayer2')[0].getBoundingClientRect()
}

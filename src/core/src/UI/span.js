import { scaleDown, scaleUp, getAnnoLayerBoundingRect, getCurrentPage } from './utils'
import SpanAnnotation from '../annotation/span'
import * as textInput from '../utils/textInput'

function scale () {
  return window.PDFView.pdfViewer.getPageView(0).viewport.scale
}

let prevprevSelectionRects
let prevSelectionRects

// TODO Need a good idea.
function watchSelectionRects () {
  setInterval(() => {
    prevprevSelectionRects = prevSelectionRects
    prevSelectionRects = getSelectionRects()
  }, 250)
}
watchSelectionRects()

/**
 * Get the current window selections and texts.
 */
function getSelectionRects () {
  try {
    let selection = window.getSelection()

    if (selection.rangeCount === 0) {
      return { rects : null, selectedText : null, textRange : null }
    }
    let range = selection.getRangeAt(0)
    let rects = range.getClientRects()

    // console.log('selection:', selection)
    const pageNumber = getPageNumber(selection.anchorNode)
    const startIndex = getIndex(selection.anchorNode)
    const endIndex = getIndex(selection.focusNode)
    // console.log('t:', pageNumber, startIndex, endIndex)

    // When no text is selected.
    if ((pageNumber === null || pageNumber === undefined)
      || (startIndex === null || startIndex === undefined)
      || (endIndex === null || endIndex === undefined)) {
      return { rects : null, selectedText : null, textRange : null }
    }

    // TODO a little tricky.
    const { text, textRange } = window.getText(pageNumber, startIndex, endIndex)
    // console.log('text:', text)
    // console.log('textRange:', textRange)

    // Bug detect.
    // This selects loadingIcon and/or loadingSpacer.
    if (selection.anchorNode && selection.anchorNode.tagName === 'DIV') {
      return { rects : null, selectedText : null, textRange : null }
    }

    if (rects.length > 0 && rects[0].width > 0 && rects[0].height > 0) {
      return { rects : mergeRects(rects), selectedText : text, textRange }
    }

  } catch (e) {
    console.log('ERROR:', e)
  }

  return { rects : null, selectedText : null, textRange : null }
}

function getPageNumber (elm) {
  if (elm.parentNode.hasAttribute('data-page')) {
    return parseInt(elm.parentNode.getAttribute('data-page'), 10)
  } else if (elm.hasAttribute && elm.hasAttribute('data-page')) {
    return parseInt(elm.getAttribute('data-page'), 10)
  }
  return null
}

function getIndex (elm) {
  if (elm.parentNode.hasAttribute('data-index')) {
    return parseInt(elm.parentNode.getAttribute('data-index'), 10)
  } else if (elm.hasAttribute && elm.hasAttribute('data-index')) {
    return parseInt(elm.getAttribute('data-index'), 10)
  }
  return null
}

/**
 * Merge user selections.
 */
function mergeRects (rects) {

  // Normalize.
  rects = rects.map(rect => {
    rect.top = rect.top || rect.y
    rect.left = rect.left || rect.x
    rect.right = rect.right || (rect.x + rect.w)
    rect.bottom = rect.bottom || (rect.y + rect.h)
    return rect
  })

  // Trim a rect which is almost same to other.
  rects = trimRects(rects)

  // a virtical margin of error.
  const error = 5 * scale()

  let tmp = convertToObject(rects[0])
  let newRects = [tmp]
  for (let i = 1; i < rects.length; i++) {

    // Same line -> Merge rects.
    if (withinMargin(rects[i].top, tmp.top, error)) {
      tmp.top    = Math.min(tmp.top, rects[i].top)
      tmp.left   = Math.min(tmp.left, rects[i].left)
      tmp.right  = Math.max(tmp.right, rects[i].right)
      tmp.bottom = Math.max(tmp.bottom, rects[i].bottom)
      tmp.x      = tmp.left
      tmp.y      = tmp.top
      tmp.width  = tmp.right - tmp.left
      tmp.height = tmp.bottom - tmp.top

      // New line -> Create a new rect.
    } else {
      tmp = convertToObject(rects[i])
      newRects.push(tmp)
    }
  }

  return newRects
}

/**
 * Trim rects which is almost same other.
 */
function trimRects (rects) {

  const error = 1.5 * scale()

  let newRects = [rects[0]]

  for (let i = 1; i < rects.length; i++) {
    if (Math.abs(rects[i].left - rects[i - 1].left) < error) {
      // Almost same.
      continue
    }
    newRects.push(rects[i])
  }

  return newRects
}

/**
 * Convert a DOMList to a javascript plan object.
 */
function convertToObject (rect) {
  return {
    top    : rect.top,
    left   : rect.left,
    right  : rect.right,
    bottom : rect.bottom,
    x      : rect.x,
    y      : rect.y,
    width  : rect.width,
    height : rect.height
  }
}

/**
 * Check the value(x) within the range.
 */
function withinMargin (x, base, margin) {
  return (base - margin) <= x && x <= (base + margin)
}

/**
 * Remove user selections.
 */
function removeSelection () {
  let selection = window.getSelection()
  // Firefox
  selection.removeAllRanges && selection.removeAllRanges()
  // Chrome
  selection.empty && selection.empty()
}

/**
 * Save a rect annotation.
 */
function saveSpan (text, zIndex, color) {

  // Get the rect area which User selected.
  // let { rects, selectedText, textRange } = getSelectionRects()
  // let { rects, selectedText, textRange } = prevprevSelectionRects || prevSelectionRects

  let rects = selectedRects
  // let selectedText = selectedText
  let textRange = selectedTextRanges

  // Remove the user selection.
  // removeSelection()

  if (!rects) {
    return
  }

  let boundingRect = getAnnoLayerBoundingRect()

  // Initialize the annotation
  let annotation = {
    rectangles : rects.map((r) => {
      return scaleUp({
        x      : r.left, // - boundingRect.left,
        y      : r.top, // - boundingRect.top,
        width  : r.width,
        height : r.height
      })
    }).filter(r => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1),
    selectedText,
    text,
    textRange,
    zIndex,
    color
  }

  console.log('annotation:', annotation, rects.map((r) => {
    return scaleUp({
      x      : r.left, // - boundingRect.left,
      y      : r.top, // - boundingRect.top,
      width  : r.width,
      height : r.height
    })
  }))

  // Save.
  let spanAnnotation = SpanAnnotation.newInstance(annotation)
  spanAnnotation.save()

  // Render.
  spanAnnotation.render()

  // Select.
  spanAnnotation.select()

  // Enable label input.
  textInput.enable({ uuid : spanAnnotation.uuid, autoFocus : true, text })

  return spanAnnotation
}

/**
 * Get the rect area of User selected.
 */
export function getRectangles () {
  // let { rects } = getSelectionRects()
  // let { rects } = prevprevSelectionRects || prevSelectionRects
  let rects = selectedRects
  if (!rects) {
    return null
  }

  const boundingRect = getAnnoLayerBoundingRect()

  rects = [...rects].map(r => {
    return scaleDown({
      x      : r.left - boundingRect.left,
      y      : r.top - boundingRect.top,
      width  : r.width,
      height : r.height
    })
  }).filter(r => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)

  return rects
}

/**
 * Create a span by current texts selection.
 */
export function createSpan ({ text = null, zIndex = 10, color = null }) {
  return saveSpan(text, zIndex, color)
}

// Temporary.
window.addEventListener('DOMContentLoaded', () => {

  function getXY (e) {
    let rect = $('#viewer')[0].getBoundingClientRect()
    let y = e.clientY + $('#viewer').scrollTop() - rect.top
    let x = e.clientX - rect.left - ($('#viewer').width() - $('#pageContainer1').width()) / 2
    return { x, y }
  }

  function getTmpLayer () {
    return document.getElementById('annoLayer2')  // TODO 2 is what?
  }

  let overlay
  let startX
  let startY

  $('#viewer').on('mousedown', e => {
    const { x, y } = getXY(e)
    // console.log('mousedown:', x, y, e)

    startX = x
    startY = y

    overlay = document.createElement('div')
    overlay.style.position = 'absolute'
    overlay.style.top = `${startY}px`
    overlay.style.left = `${startX}px`
    overlay.style.width = 0
    overlay.style.height = 0
    overlay.style.border = `2px solid #00BFFF` // Blue.
    overlay.style.boxSizing = 'border-box'
    overlay.style.visibility = 'visible'
    overlay.style.pointerEvents = 'none'
    getTmpLayer().appendChild(overlay)
  })

  $('#viewer').on('mousemove', e => {

    if (!overlay) {
      return
    }

    let { x : curX, y : curY } = getXY(e)

    let x = Math.min(startX, curX)
    let y = Math.min(startY, curY)
    let w = Math.abs(startX - curX)
    let h = Math.abs(startY - curY)

    // Move and Resize.
    overlay.style.left = x + 'px'
    overlay.style.top = y + 'px'
    overlay.style.width = w + 'px'
    overlay.style.height = h + 'px'
  })

  $('#viewer').on('mouseup', e => {

    if (!overlay) {
      return
    }

    let rect = {
      x : parseFloat(overlay.style.left),
      y : parseFloat(overlay.style.top),
      w : parseFloat(overlay.style.width),
      h : parseFloat(overlay.style.height)
    }

    $(overlay).remove()
    overlay = null

    if (rect.w < 0 && rect.h < 0) {
      // return
    }

    let pageData = getCurrentPage(rect.y)

    // console.log('mouseup:', rect, pageData)

    // Coordinates for a page.
    rect.y -= pageData.minY

    // Scale fit.
    // rect = scaleDown(rect)

    // Find texts.
    const result = window.findTexts(pageData.page, rect)
    if (!result.text) {
      console.log('notFoundX:', rect.x, (rect.x + rect.w))
      console.log('notFoundY:', rect.y, (rect.y + rect.h))
      selectedText = ''
      selectedRects = null
      selectedTextRanges = null
      return
    }

    selectedText = result.text
    selectedRects = mergeRects(result.rects)
    selectedTextRanges = result.textRange

      console.log('span selected:', selectedText, selectedRects, selectedTextRanges);

  })

})

let selectedText
let selectedRects
let selectedTextRanges






























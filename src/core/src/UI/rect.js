import { scaleDown } from './utils'
import SpanAnnotation from '../annotation/span'
import * as textInput from '../utils/textInput'
import RectAnnotation from '../annotation/rect'

// TODO 整理.
let mouseDown = false
let initPosition = null
let startPosition = null
let endPosition = null
let currentPage = null
let spanAnnotation = null

let $viewer = $('#viewer')

let x1 = null
let y1 = null
let x2 = null
let y2 = null

let drawingRectAnnotation = null

// function scale () {
//   return window.PDFView.pdfViewer.getPageView(0).viewport.scale
// }

/**
 * Merge user selections.
 */
// function mergeRects (rects) {
//
//   // Remove null.
//   rects = rects.filter(rect => rect)
//
//   // Normalize.
//   rects = rects.map(rect => {
//     rect.top = rect.top || rect.y
//     rect.left = rect.left || rect.x
//     rect.right = rect.right || (rect.x + rect.w)
//     rect.bottom = rect.bottom || (rect.y + rect.h)
//     return rect
//   })
//
//   // a virtical margin of error.
//   const error = 5 * scale()
//
//   let tmp = convertToObject(rects[0])
//   let newRects = [tmp]
//   for (let i = 1; i < rects.length; i++) {
//
//     // Same line -> Merge rects.
//     if (withinMargin(rects[i].top, tmp.top, error)) {
//       tmp.top    = Math.min(tmp.top, rects[i].top)
//       tmp.left   = Math.min(tmp.left, rects[i].left)
//       tmp.right  = Math.max(tmp.right, rects[i].right)
//       tmp.bottom = Math.max(tmp.bottom, rects[i].bottom)
//       tmp.x      = tmp.left
//       tmp.y      = tmp.top
//       tmp.width  = tmp.right - tmp.left
//       tmp.height = tmp.bottom - tmp.top
//
//       // New line -> Create a new rect.
//     } else {
//       tmp = convertToObject(rects[i])
//       newRects.push(tmp)
//     }
//   }
//
//   return newRects
// }

/**
 * Convert a DOMList to a javascript plan object.
 */
// function convertToObject (rect) {
//   return {
//     top    : rect.top,
//     left   : rect.left,
//     right  : rect.right,
//     bottom : rect.bottom,
//     x      : rect.x,
//     y      : rect.y,
//     width  : rect.width,
//     height : rect.height
//   }
// }

/**
 * Check the value(x) within the range.
 */
// function withinMargin (x, base, margin) {
//   return (base - margin) <= x && x <= (base + margin)
// }

/**
 * Save a rect annotation.
 */
// TODO 修正する.
function saveRect ({
  page = 1,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  text = '',
  color = '#FF0000',
  readOnly = false,
  zIndex = 10,
  save = true,
  focusToLabel = true,
  knob = true
}) {

  // Save.
  let rectAnnotation = RectAnnotation.newInstance(...arguments)
  if (save) {
    rectAnnotation.save()
  }

  // Render.
  rectAnnotation.render()

  // Select.
  rectAnnotation.select()

  // Enable label input.
  if (focusToLabel) {
    textInput.enable({ uuid : rectAnnotation.uuid, autoFocus : true, text })
  }

  return rectAnnotation
}

/**
 * Create a span by current texts selection.
 */
// TODO 不要.
export function createRect ({ text = null, zIndex = 10, color = null }) {

  if (!currentPage || !startPosition || !endPosition) {
    return null

  } else {

    let targets = findTexts(currentPage, startPosition, endPosition)
    if (targets.length === 0) {
      return null
    }

    let selectedText = targets.map(t => {
      return t ? t.char : ' '
    }).join('')

    const mergedRect = mergeRects(targets)
    const annotation = saveSpan({
      rects : mergedRect,
      page  : currentPage,
      text,
      zIndex,
      color,
      textRange: [ startPosition, endPosition ],
      selectedText
    })

    // Remove user selection.
    if (spanAnnotation) {
      spanAnnotation.destroy()
    }
    startPosition = null
    endPosition = null
    currentPage = null
    spanAnnotation = null

    return annotation
  }

}


// TODO 不要.
function setPositions(e) {

  const canvasElement = e.currentTarget
  const pageElement = canvasElement.parentNode
  const page = parseInt(pageElement.getAttribute('data-page-number'))
  currentPage = page

  const { top, left } = canvasElement.getBoundingClientRect()
  // let x = e.clientX - left
  // let y = e.clientY - top

  const { x, y } = scaleDown({
    x : e.clientX - left,
    y : e.clientY - top
  })

  if (!x1 || !y1) {
    x1 = x
    y1 = y
  }
  x2 = x
  y2 = y

}

function makeSelections(e) {

  setPositions(e)

  if (drawingRectAnnotation) {
    drawingRectAnnotation.destroy()
    drawingRectAnnotation = null
  }

  if (!x1 || !y1 || !x2 || !y2) {
    return
  }

  const x = Math.min(x1, x2)
  const y = Math.min(y1, y2)
  const width = Math.abs(x1 - x2)
  const height = Math.abs(y1 - y2)

  drawingRectAnnotation = saveRect({
    page         : currentPage,
    x,
    y,
    width,
    height,
    color        : '#00FF00',
    readOnly     : true,
    save         : false,
    focusToLabel : false,
    knob         : false
  })
  drawingRectAnnotation.disable()
}


window.addEventListener('DOMContentLoaded', () => {

  // Cache.
  $viewer = $('#viewer')

  $viewer.on('mousedown', '.canvasWrapper', e => {

    if (otherAnnotationTreating) {
      // Ignore, if other annotation is detected.
      return
    }

    currentPage = null
    initPosition = null
    startPosition = null
    endPosition = null

    x1 = null
    y1 = null
    x2 = null
    y2 = null

    // TODO 不要な気がするけど..
    if (drawingRectAnnotation) {
      drawingRectAnnotation.destroy()
      drawingRectAnnotation = null
    }

    // Only over the texts.
    setPositions(e)
    let target = findText(currentPage, { x : x1, y : y1 })
    if (target) {
      console.log('findText:', target, currentPage, x1, y1)
      return
    }

    mouseDown = true

    makeSelections(e)
  })

  $viewer.on('mousemove', '.canvasWrapper', e => {
    if (mouseDown) {
      makeSelections(e)
    }
  })

  $viewer.on('mouseup', '.canvasWrapper', e => {
    if (mouseDown) {
      makeSelections(e)
      if (drawingRectAnnotation) {
        drawingRectAnnotation.deselect()
      }

      // Create a rect annotation.
      // if (!x1 || !y1 || !x2 || !y2) {
      //   return
      // }
      // saveRect({
      //   page   : currentPage,
      //   x      : Math.min(x1, x2),
      //   y      : Math.min(y1, y2),
      //   width  : Math.abs(x1 - x2),
      //   height : Math.abs(y1 - y2)
      // })
    }
    mouseDown = false
    // if (drawingRectAnnotation) {
    //   drawingRectAnnotation.destroy()
    //   drawingRectAnnotation = null
    // }
  })

  let otherAnnotationTreating = false
  window.addEventListener('annotationHoverIn', () => {
    otherAnnotationTreating = true
  })
  window.addEventListener('annotationHoverOut', () => {
    otherAnnotationTreating = false
  })
  window.addEventListener('annotationDeleted', () => {
    otherAnnotationTreating = false
  })

})


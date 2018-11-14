import { scaleDown } from './utils'
import * as textInput from '../utils/textInput'
import RectAnnotation from '../annotation/rect'

/**
 * Whether the mouse is down.
 */
let mouseDown = false

/**
 * The page the rect is drawing.
 */
let drawingPage = null

/**
 * Viewer DOM element (DOM cache).
 */
let $viewer = $('#viewer')

/**
 * The positions for the rect.
 */
let x1 = null
let y1 = null
let x2 = null
let y2 = null

/**
 * The rect for user drawing.
 */
let drawingRectAnnotation = null

/**
 * Get the drawing rect data.
 */
export function getDrawingRect () {

  if (!x1 || !y1 || !x2 || !y2) {
    return
  }

  return {
    page   : drawingPage,
    x      : Math.min(x1, x2),
    y      : Math.min(y1, y2),
    width  : Math.abs(x1 - x2),
    height : Math.abs(y1 - y2)
  }
}

/**
 * Save a rect annotation.
 */
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

  let rectAnnotation = RectAnnotation.newInstance(...arguments)

  if (save) {
    rectAnnotation.save()
  }

  rectAnnotation.render()

  rectAnnotation.select()

  if (focusToLabel) {
    textInput.enable({ uuid : rectAnnotation.uuid, autoFocus : true, text })
  }

  return rectAnnotation
}

/**
 * Create a span by current texts selection.
 */
export function createRect ({ text = null, zIndex = 10, color = null }) {

  const area = getDrawingRect()
  if (!area) {
    return
  }

  const annotation = saveRect(Object.assign(area, {
    text,
    zIndex,
    color
  }))

  if (drawingRectAnnotation) {
    drawingRectAnnotation.destroy()
    drawingRectAnnotation = null
  }

  x1 = null
  y1 = null
  x2 = null
  y2 = null

  return annotation
}

/**
 * Set the rect area which user is drawing.
 */
function setPositions (e) {

  const canvasElement = e.currentTarget
  const pageElement = canvasElement.parentNode
  const page = parseInt(pageElement.getAttribute('data-page-number'))

  // Set the page for rendering a rect.
  // Only set the page at starting to draw, and after that, never change.
  if (!drawingPage) {
    drawingPage = page
  }

  // Only permitted to draw in one page.
  if (drawingPage !== page) {
    return
  }

  const { top, left } = canvasElement.getBoundingClientRect()

  const { x, y } = scaleDown({
    x : e.clientX - left,
    y : e.clientY - top
  })

  // Set the positions.
  if (!x1 || !y1) {
    x1 = x
    y1 = y
  }
  x2 = x
  y2 = y

}

/**
 * Update the drawing rect - user drawing rect.
 */
function updateDrawingRect (e) {

  setPositions(e)

  if (drawingRectAnnotation) {
    drawingRectAnnotation.destroy()
    drawingRectAnnotation = null
  }

  const area = getDrawingRect()

  drawingRectAnnotation = saveRect(Object.assign(area, {
    color        : '#00FF00',
    readOnly     : true,
    save         : false,
    focusToLabel : false,
    knob         : false
  }))

  drawingRectAnnotation.disable()
}

function reset () {
  drawingPage = null
  x1 = null
  y1 = null
  x2 = null
  y2 = null
  if (drawingRectAnnotation) {
    drawingRectAnnotation.destroy()
    drawingRectAnnotation = null
  }
}

/**
 * The entry point.
 */
window.addEventListener('DOMContentLoaded', () => {

  // Cache.
  $viewer = $('#viewer')

  $viewer.on('mousedown', '.canvasWrapper', e => {

    if (otherAnnotationTreating) {
      // Ignore, if other annotation is detected.
      return
    }

    reset()

    // Only over the texts.
    setPositions(e)
    let target = window.findText(drawingPage, { x : x1, y : y1 })
    if (target) {
      console.log('text was found, so not started to drawing rect.', target, drawingPage, x1, y1)
      return
    }

    mouseDown = true

    updateDrawingRect(e)
  })

  $viewer.on('mousemove', '.canvasWrapper', e => {
    if (mouseDown) {
      updateDrawingRect(e)
    }
  })

  $viewer.on('mouseup', '.canvasWrapper', e => {
    if (mouseDown) {
      updateDrawingRect(e)
      if (drawingRectAnnotation) {
        drawingRectAnnotation.deselect()
      }
      // Remove if only click without dragging.
      if (x1 ===  x2 && y1 === y2) {
        reset()
      }
    }
    mouseDown = false
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


import {
    scaleDown,
    getSVGLayer
} from './utils'
import SpanAnnotation from '../annotation/span'
import * as textInput from '../utils/textInput'

/**
 * Get the current window selection as rects
 *
 * @return {Array} An Array of rects
 */
function getSelectionRects () {
    try {
        let selection = window.getSelection()
        let range = selection.getRangeAt(0)
        let rects = range.getClientRects()
        let selectedText = selection.toString()

        // Bug detect.
        // This selects loadingIcon and/or loadingSpacer.
        if (selection.anchorNode && selection.anchorNode.tagName === 'DIV') {
            return { rects : null, selectedText : null }
        }

        if (rects.length > 0 && rects[0].width > 0 && rects[0].height > 0) {
            return {rects, selectedText}
        }
    } catch (e) {}

    return { rects : null, selectedText : null }
}

/**
 * Handle document.mouseup event.
 */
function handleDocumentMouseup (text, selectedText = null, rects = null, useOriginalCoords = false) {
    if (!selectedText && !rects) {
        var { rects, selectedText } = getSelectionRects()
    }
    console.log('rects=', rects)
    let annotation
    if (rects) {
        annotation = saveSpan([...rects].map((r) => {
            return {
                top    : r.top,
                left   : r.left,
                width  : r.width,
                height : r.height
            }
        }), selectedText, text, useOriginalCoords)
    }

    removeSelection()

    return annotation
}

function removeSelection () {
    let selection = window.getSelection()
    // Firefox
    selection.removeAllRanges && selection.removeAllRanges()
    // Chrome
    selection.empty && selection.empty()
}

/**
 * Save a rect annotation
 *
 * @param {String} type The type of rect (span)
 * @param {Array} rects The rects to use for annotation
 * @param {String} color The color of the rects
 */
function saveSpan (rects, selectedText, text, useOriginalCoords) {
    let svg = getSVGLayer()
    let boundingRect = svg.getBoundingClientRect()

    let br2 = scaleDown(svg, boundingRect)

    // Initialize the annotation
    let annotation = {
        rectangles : [...rects].map((r) => {
            if (useOriginalCoords) {
                return {
                    x      : r.left - br2.left,
                    y      : r.top - br2.top,
                    width  : r.width,
                    height : r.height
                }
            } else {
                return scaleDown(svg, {
                    x      : r.left - boundingRect.left,
                    y      : r.top - boundingRect.top,
                    width  : r.width,
                    height : r.height
                })
            }
        }).filter((r) => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1),
        selectedText,
        text
    }

    console.log('rects2:', annotation.rectangles)

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

export function getRectangles () {
    let { rects } = getSelectionRects()
    if (!rects) {
        return null
    }

    let svg = getSVGLayer()
    let boundingRect = svg.getBoundingClientRect()

    rects = [...rects].map((r) => {
        return scaleDown(svg, {
            x      : r.left - boundingRect.left,
            y      : r.top - boundingRect.top,
            width  : r.width,
            height : r.height
        })
    }).filter((r) => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)

    return rects
}

/**
 * Create a span by current texts selection.
 */
export function createSpan ({ text = null, selectedText = null, rects = null, useOriginalCoords = false }) {
    return handleDocumentMouseup(text, selectedText, rects, useOriginalCoords)
}

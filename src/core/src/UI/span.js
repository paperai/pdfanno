import { scaleDown, getAnnoLayerBoundingRect } from './utils'
import SpanAnnotation from '../annotation/span'
import * as textInput from '../utils/textInput'

function scale () {
    return window.PDFView.pdfViewer.getPageView(0).viewport.scale
}

/**
 * Get the current window selections and texts.
 */
function getSelectionRects () {
    try {
        let selection = window.getSelection()
        let range = selection.getRangeAt(0)
        let rects = range.getClientRects()
        let selectedText = selection.toString()

        console.log('start:', selection.anchorNode.parentNode)
        console.log('end:', selection.focusNode.parentNode)

        const pageNumber = parseInt(selection.anchorNode.parentNode.getAttribute('data-page'), 10)
        const startIndex = parseInt(selection.anchorNode.parentNode.getAttribute('data-index'), 10)
        const endIndex = parseInt(selection.focusNode.parentNode.getAttribute('data-index'), 10)
        console.log('t:', pageNumber, startIndex, endIndex)

        // TODO a little tricky.
        selectedText = window.parent.getText(pageNumber, startIndex, endIndex)
        console.log('text:', selectedText)

        // Bug detect.
        // This selects loadingIcon and/or loadingSpacer.
        if (selection.anchorNode && selection.anchorNode.tagName === 'DIV') {
            return { rects : null, selectedText : null }
        }

        if (rects.length > 0 && rects[0].width > 0 && rects[0].height > 0) {
            return mergeRects(rects, selectedText)
            // return { rects, selectedText }
        }
    } catch (e) {}

    return { rects : null, selectedText : null }
}

/**
 * Merge user selections.
 */
function mergeRects (rects, selectedText) {

    // Trim a rect which is almost same to other.
    const l = rects.length
    rects = trimRects(rects)
    console.log('length:', l, rects.length, selectedText.length)

    // a virtical margin of error.
    const error = 5 * scale()

    // a space margin.
    const space = 3 * scale()

    // new text.
    let texts = []

    let tmp = convertToObject(rects[0])
    let newRects = [tmp]
    texts.push(selectedText[0])
    for (let i = 1; i < rects.length; i++) {

        console.log('space:', /* rects[i - 1].right, rects[i].left, */(rects[i].left - rects[i - 1].right), texts.join(''), selectedText[i])

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

            // check has space.
            const prev = rects[i - 1]
            if (rects[i].left - prev.right >= space) {
                console.log('aaa')
                texts.push(' ')
            }

        // New line -> Create a new rect.
        } else {
            tmp = convertToObject(rects[i])
            newRects.push(tmp)
            // Add space.
            if (i >= 2 && selectedText[i - 1] === '-' && selectedText[i - 2] !== ' ') {
                // Remove "-"
                texts.pop()
            } else {
                texts.push(' ')
            }
        }

        // Add text.
        texts.push(selectedText[i])
    }

    // return { rects : newRects, selectedText : texts.join('') }
    return { rects : newRects, selectedText }
}

/**
 * Trim rects which is almost same other.
 */
function trimRects (rects) {

    const error = 1.5 * scale()
    console.log('error raito:', error)

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
function saveSpan (text, zIndex) {

    // Get the rect area which User selected.
    let { rects, selectedText } = getSelectionRects()

    // Remove the user selection.
    removeSelection()

    if (!rects) {
        return
    }

    let boundingRect = getAnnoLayerBoundingRect()

    // Initialize the annotation
    let annotation = {
        rectangles : rects.map((r) => {
            return scaleDown({
                x      : r.left - boundingRect.left,
                y      : r.top - boundingRect.top,
                width  : r.width,
                height : r.height
            })
        }).filter(r => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1),
        selectedText,
        text,
        zIndex
    }

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
    let { rects } = getSelectionRects()
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
export function createSpan ({ text = null, zIndex = 10 }) {
    return saveSpan(text, zIndex)
}

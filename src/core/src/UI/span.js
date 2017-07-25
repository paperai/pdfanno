import $ from 'jquery';
import {
  disableUserSelect,
  enableUserSelect,
  scaleDown,
  scaleUp,
  getSVGLayer
} from './utils';
import SpanAnnotation from '../annotation/span';
import * as textInput from '../utils/textInput';

/**
 * Get the current window selection as rects
 *
 * @return {Array} An Array of rects
 */
function getSelectionRects() {
  try {
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    let rects = range.getClientRects();
    let selectedText = selection.toString();

    // Bug detect.
    // This selects loadingIcon and/or loadingSpacer.
    if (selection.anchorNode && selection.anchorNode.tagName === 'DIV') {
        return { rects : null, selectedText : null };
    }

    if (rects.length > 0 && rects[0].width > 0 && rects[0].height > 0) {
      return {rects, selectedText};
    }

  } catch (e) {}

  return { rects : null, selectedText : null };
}


/**
 * Handle document.mouseup event.
 */
function handleDocumentMouseup(text) {

  let { rects, selectedText } = getSelectionRects();
  let annotation;
  if (rects) {
    let svg = getSVGLayer();
    annotation = saveSpan([...rects].map((r) => {
      return {
        top    : r.top,
        left   : r.left,
        width  : r.width,
        height : r.height
      };
    }), selectedText, text);
  }

  removeSelection();

  return annotation;
}

function removeSelection() {
  let selection = window.getSelection();
  // Firefox
  selection.removeAllRanges && selection.removeAllRanges();
  // Chrome
  selection.empty && selection.empty();
}

/**
 * Save a rect annotation
 *
 * @param {String} type The type of rect (span)
 * @param {Array} rects The rects to use for annotation
 * @param {String} color The color of the rects
 */
function saveSpan(rects, selectedText, text) {

  let svg = getSVGLayer();
  let boundingRect = svg.getBoundingClientRect();

  // Initialize the annotation
  let annotation = {
    rectangles: [...rects].map((r) => {
      return scaleDown(svg, {
        x      : r.left - boundingRect.left,
        y      : r.top - boundingRect.top,
        width  : r.width,
        height : r.height
      });
    }).filter((r) => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1),
    selectedText,
    text
  };

  // Save.
  let spanAnnotation = SpanAnnotation.newInstance(annotation);
  spanAnnotation.save();

  // Render.
  spanAnnotation.render();

  // Select.
  spanAnnotation.select();

  // Enable label input.
  textInput.enable({ uuid : spanAnnotation.uuid, autoFocus : true, text });

  return spanAnnotation;
}

export function getRectangles() {

    let { rects } = getSelectionRects();
    if (!rects) {
        return null;
    }

    let svg = getSVGLayer();
    let boundingRect = svg.getBoundingClientRect();

    rects = [...rects].map((r) => {
      return scaleDown(svg, {
        x      : r.left - boundingRect.left,
        y      : r.top - boundingRect.top,
        width  : r.width,
        height : r.height
      });
    }).filter((r) => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1);

    return rects;
}

/**
 * Create a span by current texts selection.
 */
export function createSpan({ text = null }) {
    return handleDocumentMouseup(text);
}

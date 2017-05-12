import $ from 'jquery';
import {
  disableUserSelect,
  enableUserSelect,
  scaleDown,
  scaleUp,
  getSVGLayer
} from './utils';
import { addInputField } from './text';
import SpanAnnotation from '../annotation/span';
import * as textInput from '../utils/textInput';

/**
 * the prev annotation rendered at the last.
 */
let prevAnnotation;

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
function handleDocumentMouseup() {

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
    }), selectedText);
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
function saveSpan(rects, selectedText) {

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
    selectedText
  };

  // Save.
  let spanAnnotation = SpanAnnotation.newInstance(annotation);
  spanAnnotation.save();

  // Render.
  spanAnnotation.render();


  // Add an input field.
  let x = annotation.rectangles[0].x + 5;  // 5 = boundingRadius(3) + 2
  let y = annotation.rectangles[0].y - 20; // 20 = circle'radius(3px) + input height(14px) + α
  let rect = svg.getBoundingClientRect();

  x = scaleUp(svg, {x}).x + rect.left;
  y = scaleUp(svg, {y}).y + rect.top;

  // disableUserSelect();

  // document.removeEventListener('mouseup', handleDocumentMouseup);

  // Select.
  spanAnnotation.select();

  // New type text.
  textInput.enable({ uuid : spanAnnotation.uuid, autoFocus : true });


  // // New type text.
  // textInput.enable({ uuid : spanAnnotation.uuid, autoFocus : true , blurListener : () => {
  //   // spanAnnotation.enable();
  //   window.annotationContainer.enableAll();
  // }});
  // // spanAnnotation.disable();
  // window.annotationContainer.disableAll();






  // addInputField(x, y, null, null, (text) => {

  //   // document.addEventListener('mouseup', handleDocumentMouseup);

  //   spanAnnotation.text = text;
  //   spanAnnotation.setTextForceDisplay();
  //   spanAnnotation.render();
  //   spanAnnotation.save();
  //   spanAnnotation.enableViewMode();

  // });

  if (prevAnnotation) {
    prevAnnotation.resetTextForceDisplay();
    prevAnnotation.render();
    prevAnnotation.enableViewMode();
  }
  prevAnnotation = spanAnnotation;


  return spanAnnotation;

}

export function getRectangles() {

    let { rects } = getSelectionRects();
    if (!rects) {
        return null;
    }
    console.log('rects1:', rects);

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

    console.log('rects2:', rects);

    return rects;

}

/**
 * Create a span by current texts selection.
 */
export function createSpan() {
    return handleDocumentMouseup();
}

/**
 * Enable hightlight behavior.
 */
export function enableSpan() {
  this.disableSpan();
  document.addEventListener('mouseup', handleDocumentMouseup);


  // $('.textLayer').css('z-index', 3); // over svg layer.
}

/**
 * Disable hightlight behavior.
 */
export function disableSpan() {
  document.removeEventListener('mouseup', handleDocumentMouseup);


  // $('.textLayer').css('z-index', 1);

  if (prevAnnotation) {
    prevAnnotation.resetTextForceDisplay();
    prevAnnotation.render();
    prevAnnotation.enableViewMode();
    prevAnnotation = null;
  }

}

import $ from 'jquery';
import PDFJSAnnotate from '../PDFJSAnnotate';
import appendChild from '../render/appendChild';
import {
  BORDER_COLOR,
  disableUserSelect,
  enableUserSelect,
  findSVGAtPoint,
  getMetadata,
  getOffset,
  scaleDown,
  scaleUp,
  getXY,
  getSVGLayer  
} from './utils';
import { addInputField } from './text';

const _type = 'highlight';

let _enabled = false;
let overlay;
let originY;
let originX;

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

    if (rects.length > 0 && rects[0].width > 0 && rects[0].height > 0) {
      return rects;
    }
    
  } catch (e) {}
  
  return null;
}


/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {

  let rects = getSelectionRects();
  if (rects) {
    let svg = getSVGLayer();
    saveRect([...rects].map((r) => {
      return {
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height
      };
    }));
  }

  removeSelection();
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
 * @param {String} type The type of rect (area, highlight, strikeout)
 * @param {Array} rects The rects to use for annotation
 * @param {String} color The color of the rects
 */
function saveRect(rects) {

  let svg = getSVGLayer();
  let node;
  let annotation;

  let boundingRect = svg.getBoundingClientRect();


  // Initialize the annotation
  annotation = {
    type : _type,
    rectangles: [...rects].map((r) => {
      return scaleDown(svg, {
        x      : r.left - boundingRect.left,
        y      : r.top - boundingRect.top,
        width  : r.width,
        height : r.height
      });
    }).filter((r) => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)
  };
  

  let { documentId, pageNumber } = getMetadata(svg);

  // Add the annotation
  PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation).then((annotation) => {

    console.log('annotation:', annotation);

    appendChild(svg, annotation);

    // Add an input field.
    let x = annotation.rectangles[0].x + 5;  // 5 = boundingRadius(3) + 2
    let y = annotation.rectangles[0].y - 20; // 20 = circle'radius(3px) + input height(14px) + α
    let rect = svg.getBoundingClientRect();

    x = scaleUp(svg, {x}).x + rect.left;
    y = scaleUp(svg, {y}).y + rect.top;

    addInputField(x, y, null, null, (textAnnotation) => {

      if (!textAnnotation) {
        return;
      }

      // FIXME: cannot stop refarence counter. I wanna use the original `annotation`, but couldn't.
      PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, annotation.uuid).then(annotation => {

        // Set relation between arrow and text.
        annotation.text = textAnnotation.uuid;

        // Update data.
        PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotation.uuid, annotation);

        // Update UI.
        $(`[data-pdf-annotate-id="${annotation.uuid}"]`).attr('data-text', textAnnotation.uuid);

      });
    });

  });
}

/**
 * Enable rect behavior
 */
export function enableHighlight() {
  
  if (_enabled) { return; }

  _enabled = true;
  document.addEventListener('mouseup', handleDocumentMouseup);
}

/**
 * Disable rect behavior
 */
export function disableHighlight() {

  if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mouseup', handleDocumentMouseup);
}

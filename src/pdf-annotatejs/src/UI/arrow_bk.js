import PDFJSAnnotate from '../PDFJSAnnotate';
import appendChild from '../render/appendChild';
import {
  disableUserSelect,
  enableUserSelect,
  findSVGAtPoint,
  getMetadata,
  scaleDown
} from './utils';

let _enabled = false;

let arrow;
let lines;

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

    if (rects.length > 0 &&
        rects[0].width > 0 &&
        rects[0].height > 0) {
      return rects;
    }
  } catch (e) {}
  
  return null;
}

/**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousedown(e) {
  let svg = findSVGAtPoint(e.clientX, e.clientY);
  if (!svg) {
    return;
  }
  
  arrow = null;
  lines = [];

  document.addEventListener('mousemove', handleDocumentMousemove);

  disableUserSelect();
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousemove(e) {
  saveArrow(e.clientX, e.clientY);
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {

  let svg = findSVGAtPoint(e.clientX, e.clientY);

  if (svg && lines.length > 1) {

    if (arrow) {
      svg.removeChild(arrow);
    }

    let annotation = {
      x1: lines[0][0],
      y1: lines[0][1],
      x2: lines[1][0],
      y2: lines[1][1],
      type: 'arrow',
      color: 'FF0000'
    };

    let { documentId, pageNumber } = getMetadata(svg);

    PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation)
      .then((annotation) => {
        appendChild(svg, annotation);
      });
  }

  document.removeEventListener('mousemove', handleDocumentMousemove);
  enableUserSelect();
}

/**
 * Handle document.keyup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentKeyup(e) {
  // Cancel arrow if Esc is pressed
  if (e.keyCode === 27) {
    lines = null;
    if (arrow) {
      arrow.parentNode.removeChild(arrow);
    }
    document.removeEventListener('mousemove', handleDocumentMousemove);
    document.removeEventListener('mousemove', handleDocumentMouseup);
  }
}

/**
  Save arrow information(x1,y1,x2,y2) and show an arrow.

  @param {Float} x : the point of x.
  @param {Float} y : the point of y.
*/
function saveArrow(x, y) {
  let svg = findSVGAtPoint(x, y);
  if (!svg) {
    return;
  }

  let rect = svg.getBoundingClientRect();
  let point = scaleDown(svg, {
    x: x - rect.left,
    y: y - rect.top
  });

  lines.push([point.x, point.y]);
  if (lines.length > 1) {
    lines = [lines[0], lines[lines.length-1]];
  }

  if (lines.length <= 1) {
    return;
  }

  if (arrow) {
    svg.removeChild(arrow);
  }

  arrow = appendChild(svg, {
    x1: lines[0][0],
    y1: lines[0][1],
    x2: lines[1][0],
    y2: lines[1][1],
    type: 'arrow',
    color: 'FF0000'
  });
}

/**
 * Enable arrow behavior.
 */
export function enableArrow() {
  if (_enabled) { return; }

  _enabled = true;
  document.addEventListener('mouseup', handleDocumentMouseup);
  document.addEventListener('mousedown', handleDocumentMousedown);
  document.addEventListener('keyup', handleDocumentKeyup);
}

/**
 * Disable arrow behavior.
 */
export function disableArrow() {
  if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mouseup', handleDocumentMouseup);
  document.removeEventListener('mousedown', handleDocumentMousedown);
  document.removeEventListener('keyup', handleDocumentKeyup);
}

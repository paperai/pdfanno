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
  getXY
} from './utils';
import { addInputField } from './text';

let _enabled = false;
let _type;
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

    if (rects.length > 0 &&
        rects[0].width > 0 &&
        rects[0].height > 0) {
      console.log('getSelectionRects:', rects);
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
  let svg;
  if (_type !== 'area' || !(svg = findSVGAtPoint(e.clientX, e.clientY))) {
    return;
  }

  // let rect = svg.getBoundingClientRect();
  // console.log('rect:', rect);
  // originY = e.clientY;
  // originX = e.clientX;

  let { x, y } = getXY(e);
  originX = x;
  originY = y;



  overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  // overlay.style.top = `${originY - rect.top}px`;
  // overlay.style.left = `${originX - rect.left}px`;
  overlay.style.top = `${originY}px`;
  overlay.style.left = `${originX}px`;

  overlay.style.border = `2px solid ${BORDER_COLOR}`;
  overlay.style.boxSizing = 'border-box';
  svg.parentNode.appendChild(overlay);
  
  document.addEventListener('mousemove', handleDocumentMousemove);
  disableUserSelect();
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousemove(e) {
  // let svg = overlay.parentNode.querySelector('svg.annotationLayer');

  let { x : curX, y : curY } = getXY(e);



  // let svg = document.getElementById('annoLayer'); // TODO make it const.
  // let rect = svg.getBoundingClientRect();

  let x      = Math.min(originX, curX);
  let y      = Math.min(originY, curY);
  let width  = Math.abs(originX - curX);
  let height = Math.abs(originY - e.clientY);

  overlay.style.left   = x + 'px';
  overlay.style.top    = y + 'px';
  overlay.style.width  = width + 'px';
  overlay.style.height = height + 'px';
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {
  let rects;
  if (_type !== 'area' && (rects = getSelectionRects())) {
    let svg = findSVGAtPoint(rects[0].left, rects[0].top);
    saveRect(_type, [...rects].map((r) => {
      return {
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height
      };
    }));
  } else if (_type === 'area' && overlay) {
    // let svg = overlay.parentNode.querySelector('svg.annotationLayer');
    let svg = document.getElementById('annoLayer'); // TODO make it const.
    let rect = svg.getBoundingClientRect();
    saveRect(_type, [{
      top: parseInt(overlay.style.top, 10) + rect.top,
      left: parseInt(overlay.style.left, 10) + rect.left,
      width: parseInt(overlay.style.width, 10),
      height: parseInt(overlay.style.height, 10)
    }]);

    overlay.parentNode.removeChild(overlay);
    overlay = null;

    document.removeEventListener('mousemove', handleDocumentMousemove);
    enableUserSelect();
  }

  if (_type === 'highlight') {
    removeSelection();
  }
}

function removeSelection() {
  let selection = window.getSelection();
  // Firefox
  selection.removeAllRanges && selection.removeAllRanges();
  // Chrome
  selection.empty && selection.empty();
}

/**
 * Handle document.keyup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentKeyup(e) {
  // Cancel rect if Esc is pressed
  if (e.keyCode === 27) {
    removeSelection();
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      overlay = null;
      document.removeEventListener('mousemove', handleDocumentMousemove);
    }
  }
}

/**
 * Save a rect annotation
 *
 * @param {String} type The type of rect (area, highlight, strikeout)
 * @param {Array} rects The rects to use for annotation
 * @param {String} color The color of the rects
 */
function saveRect(type, rects, color) {
  let svg = findSVGAtPoint(rects[0].left, rects[0].top);
  let node;
  let annotation;

  if (!svg) {
    return;
  }

  let boundingRect = svg.getBoundingClientRect();

  if (!color) {
    if (type === 'highlight') {
      color = 'FFFF00';
    } else if (type === 'strikeout') {
      color = 'FF0000';
    }
  }

  // Initialize the annotation
  annotation = {
    type,
    color,
    rectangles: [...rects].map((r) => {
      let offset = 0;

      if (type === 'strikeout') {
        offset = r.height / 2;
      }
      if (type === 'highlight') {
        return scaleDown(svg, {
          y: (r.top + offset) - boundingRect.top,
          x: r.left - boundingRect.left,
          width: r.width,
          height: r.height
        });        
      }
      return scaleDown(svg, {
        y: (r.top + offset) - boundingRect.top,
        x: r.left - boundingRect.left,
        width: r.width,
        height: r.height
      });
    }).filter((r) => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)
  };
  
  // Short circuit if no rectangles exist
  if (annotation.rectangles.length === 0) {
    return;
  }

  // Special treatment for area as it only supports a single rect
  if (type === 'area') {
    let rect = annotation.rectangles[0];
    delete annotation.rectangles;
    annotation.x = rect.x;
    annotation.y = rect.y;
    annotation.width = rect.width;
    annotation.height = rect.height;
  }

  let { documentId, pageNumber } = getMetadata(svg);

  // Add the annotation
  PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation).then((annotation) => {
    appendChild(svg, annotation);

    // Add an input field.
    if (type === 'highlight') {

      let x = annotation.rectangles[0].x;
      let y = annotation.rectangles[0].y - 20; // 20 = circle'radius(3px) + input height(14px) + α
      let rect = svg.getBoundingClientRect();

      x = scaleUp(svg, {x}).x + rect.left;
      y = scaleUp(svg, {y}).y + rect.top;

      addInputField(x, y, null, null, (textAnnotation) => {

        if (!textAnnotation) {
          return;
        }

        // Set relation between arrow and text.
        annotation.text = textAnnotation.uuid;

        // Update data.
        PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotation.uuid, annotation);

        // Update UI.
        $(`[data-pdf-annotate-id="${annotation.uuid}"]`).attr('data-text', textAnnotation.uuid);
      });
    }

  });
}

/**
 * Enable rect behavior
 */
export function enableRect(type) {
  _type = type;
  
  if (_enabled) { return; }

  _enabled = true;
  document.addEventListener('mouseup', handleDocumentMouseup);
  document.addEventListener('mousedown', handleDocumentMousedown);
  document.addEventListener('keyup', handleDocumentKeyup);
}

/**
 * Disable rect behavior
 */
export function disableRect() {
  if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mouseup', handleDocumentMouseup);
  document.removeEventListener('mousedown', handleDocumentMousedown);
  document.removeEventListener('keyup', handleDocumentKeyup);
}

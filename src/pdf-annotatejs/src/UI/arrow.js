import $ from 'jquery';
import PDFJSAnnotate from '../PDFJSAnnotate';
import appendChild from '../render/appendChild';
import {
  disableUserSelect,
  enableUserSelect,
  findSVGAtPoint,
  getMetadata,
  scaleDown,
  scaleUp
} from './utils';
import { getRelationTextPosition } from '../utils/relation.js';
import { addInputField } from './text';
import uuid from '../utils/uuid';

let filter = Array.prototype.filter;
let forEach = Array.prototype.forEach;

let _enabled = false;

let _arrowType;

let arrow;
let lines;

let dragging = false;

let svg;

const BORDER_COLOR = '#FF0000';
const BGCOLOR = '#FFFF00';
const BGCOLOR_SELECTED = '#FF0000';

let boundingCircles = [];
let hitBoundingCircle;
let startBoundingCircle;
let endBoundingCircle;


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

  disableUserSelect();

  if (hitBoundingCircle) {
    startBoundingCircle = hitBoundingCircle;
    dragging = true;
  }
}

function getClientXY(e) {
  let rect = svg.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  return {x, y};
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousemove(e) {

  let circle = findHitBoundingCircle(e);
  if (circle) {
      if (!hitBoundingCircle) {
          hitBoundingCircle = circle;
          setVisibility(hitBoundingCircle, BGCOLOR_SELECTED);
      }
  } else {
      if (hitBoundingCircle) {
        setVisibility(hitBoundingCircle, BGCOLOR);
          hitBoundingCircle = null;
      }
  }

  if (dragging) {
    saveArrow(e.clientX, e.clientY);    
  }
}

function setVisibility(circle, style) {
  if (style === BGCOLOR_SELECTED) {
    // <animatetransform attributetype="xml" attributename="transform" type="scale" begin="0.7s" dur="0.5s" values="1 1;1.7 1;1 1" calcmode="spline" keysplines=".2,0 .8,.4; .2,.6 .8,1" additive="sum">
    $(circle.parentNode).find('rect').addClass('--hover');
  } else {
    $(circle.parentNode).find('rect').removeClass('--hover');
  }
}

function findHitBoundingCircle(e) {

    // Mouse Point.
    let point = scaleDown(svg, getClientXY(e));

    for (let i = 0; i < boundingCircles.length; i++) {
        if (isCircleHit(point, boundingCircles[i])) {
            return boundingCircles[i];
        }
    }

    // Notfound.
    return null;
}

function isCircleHit(pos, element) {
    // <circle cx="100" cy="100" r="100"/>
    let r = parseFloat(element.getAttribute('r'));
    let x = parseFloat(element.getAttribute('cx'));
    let y = parseFloat(element.getAttribute('cy'));
    let distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
    return distance <= r;
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {

  dragging = false;

  cancelArrow();

  let svg = findSVGAtPoint(e.clientX, e.clientY);
  if (!svg) {
    console.log('not found svg.');
    return;
  }

  // End point.
  endBoundingCircle = hitBoundingCircle;

  // Check valid.
  if (!endBoundingCircle) {
    return console.log('not specified end point.');
  }
  if (!startBoundingCircle) {
    return console.log('not specified start point.');
  }
  if (startBoundingCircle === endBoundingCircle) {
    return console.log('start/end are same.');
  }

  // Create annotation.
  let startPos = {
    x: parseFloat(startBoundingCircle.getAttribute('cx')),
    y: parseFloat(startBoundingCircle.getAttribute('cy'))
  };
  let endPos = {
    x: parseFloat(endBoundingCircle.getAttribute('cx')),
    y: parseFloat(endBoundingCircle.getAttribute('cy'))    
  }
  let annotation = {
    x1: startPos.x,
    y1: startPos.y,
    x2: endPos.x,
    y2: endPos.y,
    type : 'arrow',
    direction : _arrowType,
    color : 'FF0000',
    highlight1 : startBoundingCircle.parentNode.getAttribute('data-pdf-annotate-id'),
    highlight2 : endBoundingCircle.parentNode.getAttribute('data-pdf-annotate-id'),
  };

  let { documentId, pageNumber } = getMetadata(svg);
  PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation)
    .then((annotation) => {
      let arrow = appendChild(svg, annotation);

      let arrowId = annotation.uuid;

      // add text input.
      let s = scaleUp(svg, startPos);
      let e = scaleUp(svg, endPos);
      showTextInput(s, e, annotation);
    });
}

function showTextInput(start, end, arrowAnnotation) {

  let textPosition = getRelationTextPosition(svg, start.x, start.y, end.x, end.y);

  addInputField(textPosition.x, textPosition.y, null, null, (textAnnotation) => {

    if (!textAnnotation) {
      return;
    }

    // Set relation between arrow and text.
    arrowAnnotation.text = textAnnotation.uuid;

    // Update.
    // let element = document.querySelector('.annotationLayer');
    let element = document.getElementById('annoLayer'); // TODO make it const.
    let documentId = element.getAttribute('data-pdf-annotate-document');  // 共通化
    PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, arrowAnnotation.uuid, arrowAnnotation);

    // Update UI.
    console.log('arrow:', $(`[data-pdf-annotate-id="${arrowAnnotation.uuid}"]`));
    $(`[data-pdf-annotate-id="${arrowAnnotation.uuid}"]`).attr('data-text', textAnnotation.uuid);

  });
}

/**
 * Handle document.keyup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentKeyup(e) {
  // Cancel arrow if Esc is pressed
  if (e.keyCode === 27) {
    cancelArrow();
  }
}

function cancelArrow() {
  lines = null;
  if (arrow) {
    arrow.parentNode.removeChild(arrow);
    arrow = null;
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
    direction : _arrowType
  });
}

/**
  Show BoundingBox on highlight objects.
*/
function showBoundingBox() {

  // svg = document
  //             .querySelector('#pageContainer' + PDFView.page)
  //             .querySelector('svg');

  svg = document.getElementById('annoLayer'); // TODO make it const.

  // Collect boundingCircles for highlight.
  boundingCircles = [];
  forEach.call(svg.querySelectorAll('g > [type="boundingCircle"]'), boundingCircle => {
    if ($(boundingCircle).closest('g').attr('read-only') !== 'true') {
      boundingCircles.push(boundingCircle);
    } else {
      $(boundingCircle).hide();
    }
  });

}

function disableTextlayer() {
  let currentPage = PDFView.page;
  let textLayer = document.querySelector('#pageContainer' + currentPage + ' .textLayer');
  textLayer.style.pointerEvents = 'None';
}

function enableTextlayer() {
  let currentPage = PDFView.page;
  let textLayer = document.querySelector('#pageContainer' + currentPage + ' .textLayer');
  textLayer.style.pointerEvents = 'Auto';
}

function deleteBoundingBoxes() {
  boundingCircles = [];

  // Collect boundingCircles for highlight.
  forEach.call(svg.querySelectorAll('g > [type="boundingCircle"]'), boundingCircle => {
    if ($(boundingCircle).closest('g').attr('read-only') === 'true') {
      $(boundingCircle).show();
    }
  });


}

/**
 * Enable arrow behavior.
 */
export function enableArrow(arrowType='one-way') {
  if (_enabled) { return; }

  _enabled = true;
  _arrowType = arrowType;

  console.log('enableArrow: ', _arrowType);

  showBoundingBox();
  disableUserSelect();
  disableTextlayer();

  document.addEventListener('mouseup', handleDocumentMouseup);
  document.addEventListener('mousedown', handleDocumentMousedown);
  document.addEventListener('mousemove', handleDocumentMousemove);
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
  document.removeEventListener('mousemove', handleDocumentMousemove);

  enableUserSelect();
  enableTextlayer();

  deleteBoundingBoxes();  
}

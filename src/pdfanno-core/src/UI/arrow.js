import $ from 'jquery';
import appendChild from '../render/appendChild';
import {
  disableUserSelect,
  enableUserSelect,
  findSVGAtPoint,
  getMetadata,
  scaleDown,
  scaleUp,
  getSVGLayer
} from './utils';
import { getRelationTextPosition } from '../utils/relation.js';
import { addInputField } from './text';
import uuid from '../utils/uuid';

import ArrowAnnotation from '../annotation/arrow';

let _hoverAnnotation = null;
let arrowAnnotation = null;

let forEach = Array.prototype.forEach;

let _enabled = false;

let _arrowType;

let arrow;

let dragging = false;

let svg;

let boundingCircles = [];

let hitCircle = null;

/**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousedown(e) {

  if (_hoverAnnotation) {
    arrowAnnotation = new ArrowAnnotation();
    arrowAnnotation.direction = _arrowType;
    arrowAnnotation.rel1Annotation = _hoverAnnotation;
    arrowAnnotation.readOnly = false;
    arrowAnnotation.setDisableHoverEvent();

    document.addEventListener('mouseup', handleDocumentMouseup);

    disableAnnotationHoverEvent();

    dragging = true;
  }

}

function getClientXY(e) {
  let svg = getSVGLayer();
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

  if (dragging) {
    let p = scaleDown(getClientXY(e));
    arrowAnnotation.x2 = p.x;
    arrowAnnotation.y2 = p.y;
    arrowAnnotation.render();
  }

  // Hover visual event.
  let circle = findHitBoundingCircle(e);
  if (!hitCircle && circle) {
    hitCircle = circle;
    $(hitCircle).parents('g').addClass('--hover');

  } else if (hitCircle && !circle) {
    $(hitCircle).parents('g').removeClass('--hover');
    hitCircle = null;
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

  document.removeEventListener('mouseup', handleDocumentMouseup);

  enableAnnotationHoverEvent();

  // FIXME use drag and drop event, it may be better.

  // Find the end position.
  let circle = findHitBoundingCircle(e);
  if (!circle) {
    arrowAnnotation.destroy();
    arrowAnnotation = null;
    return;
  }

  let uuid = circle.parentNode.getAttribute('data-pdf-annotate-id');
  let endAnnotation = window.annotationContainer.findById(uuid);
  if (arrowAnnotation.rel1Annotation === endAnnotation) {
    arrowAnnotation.destroy();
    arrowAnnotation = null;
    return;
  }

  arrowAnnotation.rel2Annotation = endAnnotation;
  arrowAnnotation.setEnableHoverEvent();

  arrowAnnotation.save();

  showTextInput();

}

function showTextInput() {

  let p1 = arrowAnnotation.rel1Annotation.getBoundingCirclePosition();
  let p2 = arrowAnnotation.rel2Annotation.getBoundingCirclePosition();
  let textPosition = getRelationTextPosition(p1.x, p1.y, p2.x, p2.y);

  let boundingRect = svg.getBoundingClientRect();

  let x = scaleUp(svg, {x : textPosition.x}).x + boundingRect.left;
  let y = scaleUp(svg, {y : textPosition.y}).y + boundingRect.top;

  addInputField(x, y, null, null, (text) => {

    arrowAnnotation.text = text;
    arrowAnnotation.setTextForceDisplay();
    arrowAnnotation.save();
    arrowAnnotation.render();

  }, 'text');
}

/**
  Show BoundingBox on highlight objects.
  FIXME wanna remove this.
*/
function createBoundingBoxList() {
  svg = getSVGLayer();
  boundingCircles = [];
  forEach.call(svg.querySelectorAll('g > [type="boundingCircle"]'), boundingCircle => {
    if ($(boundingCircle).closest('g').attr('read-only') !== 'true') {
      boundingCircles.push(boundingCircle);
    }
  });
}

function disableAnnotationHoverEvent() {
    // Disable annotation original hover event,
    // bacause the event occur intermittently at mouse dragging.
    $('svg > g').css('pointer-events', 'none');
}

function enableAnnotationHoverEvent() {
    $('svg > g').css('pointer-events', 'auto');
}

function disableTextlayer() {
  $('.textLayer').hide();
}

function enableTextlayer() {
  $('.textLayer').show();
}

/**
 * TODO wanna remove this.
 */
function deleteBoundingBoxList() {
  boundingCircles = [];
}

function handleBoundingCircleHoverIn(annotation) {
  // console.log('handleBoundingCircleHoverIn');
  _hoverAnnotation = annotation;
}

function handleBoundingCircleHoverOut(annotation) {
  // console.log('handleBoundingCircleHoverOut');
  _hoverAnnotation = null;
}


/**
 * Enable arrow behavior.
 */
export function enableArrow(arrowType='one-way') {
  if (_enabled) { return; }

  _enabled = true;
  _arrowType = arrowType;

  createBoundingBoxList();
  disableUserSelect();
  disableTextlayer();

  document.addEventListener('mousedown', handleDocumentMousedown);
  document.addEventListener('mousemove', handleDocumentMousemove);

  window.annotationContainer.getAllAnnotations().forEach(a => {

    if (a.hasBoundingCircle()) {

      if (a.readOnly) {
        a.hideBoundingCircle();

      } else {
        a.on('circlehoverin', handleBoundingCircleHoverIn);
        a.on('circlehoverout', handleBoundingCircleHoverOut);
      }
    }

  });

}

/**
 * Disable arrow behavior.
 */
export function disableArrow() {
  if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mousedown', handleDocumentMousedown);
  document.removeEventListener('mousemove', handleDocumentMousemove);

  enableUserSelect();
  enableTextlayer();

  deleteBoundingBoxList();

  window.annotationContainer.getAllAnnotations().forEach(a => {

    if (a.hasBoundingCircle()) {

      if (a.readOnly) {
        a.showBoundingCircle();

      } else {
        a.removeListener('circlehoverin', handleBoundingCircleHoverIn);
        a.removeListener('circlehoverout', handleBoundingCircleHoverOut);
      }

    }

  });

}

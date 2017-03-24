import $ from 'jquery';
import appendChild from '../render/appendChild';
import {
  disableUserSelect,
  enableUserSelect,
  scaleDown,
  scaleUp,
  getSVGLayer,
  disableTextlayer,
  enableTextlayer
} from './utils';
import { getRelationTextPosition } from '../utils/relation.js';
import { addInputField } from './text';

import RelationAnnotation from '../annotation/relation';

/**
 * the prev annotation rendered at the last.
 */
let prevAnnotation;

let _hoverAnnotation = null;
let relationAnnotation = null;

let forEach = Array.prototype.forEach;

let _enabled = false;

let _relationType;

let startAnnotation;
let mousedownFired = false;
let mousemoveFired = false;

let svg;

let boundingCircles = [];

let hitCircle = null;

/**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousedown(e) {

    mousedownFired = true;

  if (_hoverAnnotation) {
    relationAnnotation = new RelationAnnotation();
    relationAnnotation.direction = _relationType;
    relationAnnotation.rel1Annotation = _hoverAnnotation;
    relationAnnotation.readOnly = false;
    relationAnnotation.setDisableHoverEvent();

    disableAnnotationHoverEvent();

    startAnnotation = _hoverAnnotation;
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

    if (mousedownFired) {
        mousemoveFired = true;
    }

    // draw temporary arrow, if now drawing.
    if (mousedownFired && mousemoveFired) {
        let p = scaleDown(getClientXY(e));
        relationAnnotation.x2 = p.x;
        relationAnnotation.y2 = p.y;
        relationAnnotation.render();
    }

  // Hover visual event.
  let circle = findHitBoundingCircle(e);
  if (!hitCircle && circle) {
    hitCircle = circle;
    let uuid = $(hitCircle).parents('g').data('pdf-annotate-id');
    let annotation = window.annotationContainer.findById(uuid);
    if (annotation) {
        annotation.highlight();
    }

  } else if (hitCircle && !circle) {
    let uuid = $(hitCircle).parents('g').data('pdf-annotate-id');
    let annotation = window.annotationContainer.findById(uuid);
    if (annotation) {
        annotation.dehighlight();
    }
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

/**
 * Judge whether the mouse pointer on a circle.
 */
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

  let clicked = mousedownFired && !mousemoveFired;
  let dragged = mousedownFired && mousemoveFired;

  mousedownFired = false;
  mousemoveFired = false;

  enableAnnotationHoverEvent();

  // Behave as clicked.
  if (clicked) {
    if (startAnnotation && startAnnotation.handleClickEvent) {
        startAnnotation.handleClickEvent();
    }
    startAnnotation = null;

    relationAnnotation && relationAnnotation.destroy();
    relationAnnotation = null;

    return;
  }

  startAnnotation = null;

  if (!relationAnnotation) {
    return;
  }

  // Find the end position.
  let circle = findHitBoundingCircle(e);
  if (!circle) {
    relationAnnotation.destroy();
    relationAnnotation = null;
    return;
  }

  let uuid = circle.parentNode.getAttribute('data-pdf-annotate-id');
  let endAnnotation = window.annotationContainer.findById(uuid);
  if (relationAnnotation.rel1Annotation === endAnnotation) {
    relationAnnotation.destroy();
    relationAnnotation = null;
    return;
  }

  relationAnnotation.rel2Annotation = endAnnotation;
  relationAnnotation.setEnableHoverEvent();

  relationAnnotation.save();

  showTextInput(relationAnnotation);


  if (prevAnnotation) {
    prevAnnotation.resetTextForceDisplay();
    prevAnnotation.render();
    prevAnnotation.enableViewMode();
  }
  prevAnnotation = relationAnnotation;

  relationAnnotation = null;

}

/**
 * Show the input field to add a new text.
 */
function showTextInput(relationAnnotation) {

  let p1 = relationAnnotation.rel1Annotation.getBoundingCirclePosition();
  let p2 = relationAnnotation.rel2Annotation.getBoundingCirclePosition();
  let textPosition = getRelationTextPosition(p1.x, p1.y, p2.x, p2.y);

  let boundingRect = svg.getBoundingClientRect();

  let x = scaleUp(svg, {x : textPosition.x}).x + boundingRect.left;
  let y = scaleUp(svg, {y : textPosition.y}).y + boundingRect.top;

  addInputField(x, y, null, null, (text) => {

    relationAnnotation.text = text;
    relationAnnotation.setTextForceDisplay();
    relationAnnotation.save();
    relationAnnotation.render();
    relationAnnotation.enableViewMode();

  });
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

/**
 * TODO wanna remove this.
 */
function deleteBoundingBoxList() {
  boundingCircles = [];
}

function handleBoundingCircleHoverIn(annotation) {
  _hoverAnnotation = annotation;
}

function handleBoundingCircleHoverOut(annotation) {
  _hoverAnnotation = null;
}


/**
 * Enable relation behavior.
 */
export function enableRelation(relationType='one-way') {

  if (_enabled) { return; }

  _enabled = true;
  _relationType = relationType;

  createBoundingBoxList();
  disableUserSelect();
  disableTextlayer();

  document.addEventListener('mousedown', handleDocumentMousedown);
  document.addEventListener('mousemove', handleDocumentMousemove);
  document.addEventListener('mouseup', handleDocumentMouseup);

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

  window.globalEvent.emit('enableRelation');

}

/**
 * Disable relation behavior.
 */
export function disableRelation() {
  if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mousedown', handleDocumentMousedown);
  document.removeEventListener('mousemove', handleDocumentMousemove);
  document.removeEventListener('mouseup', handleDocumentMouseup);

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

  if (prevAnnotation) {
    prevAnnotation.resetTextForceDisplay();
    prevAnnotation.render();
    prevAnnotation.enableViewMode();
    prevAnnotation = null;
  }

  window.globalEvent.emit('disableRelation');

}

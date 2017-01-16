import $ from 'jquery';
import PDFJSAnnotate from '../PDFJSAnnotate';
// import { getSVGLayer } from '../UI/utils';
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

  if (_hoverAnnotation) {
    arrowAnnotation = new ArrowAnnotation();
    arrowAnnotation.direction = _arrowType;
    arrowAnnotation.rel1Annotation = _hoverAnnotation;
    arrowAnnotation.readOnly = false;

    document.addEventListener('mouseup', handleDocumentMouseup);
    document.addEventListener('mousemove', handleDocumentMousemove);    
  }


  // let svg = findSVGAtPoint(e.clientX, e.clientY);
  // if (!svg) {
  //   return;
  // }
  
  // arrow = null;
  // lines = [];

  // disableUserSelect();

  // if (hitBoundingCircle) {
  //   startBoundingCircle = hitBoundingCircle;
  //   dragging = true;
  // }
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

  let p = scaleDown(getClientXY(e));
  arrowAnnotation.x2 = p.x;
  arrowAnnotation.y2 = p.y;
  arrowAnnotation.render();

  // let circle = findHitBoundingCircle(e);
  // if (circle) {
  //     if (!hitBoundingCircle) {
  //         hitBoundingCircle = circle;
  //         setVisibility(hitBoundingCircle, BGCOLOR_SELECTED);
  //     }
  // } else {
  //     if (hitBoundingCircle) {
  //       setVisibility(hitBoundingCircle, BGCOLOR);
  //         hitBoundingCircle = null;
  //     }
  // }

  // if (dragging) {
  //   saveArrow(e.clientX, e.clientY);    
  // }
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

  document.removeEventListener('mouseup', handleDocumentMouseup);
  document.removeEventListener('mousemove', handleDocumentMousemove);

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




  // if (!_hoverAnnotation
  //     || arrowAnnotation.rel1Annotation === _hoverAnnotation) {

  //   arrowAnnotation.destroy();
  //   arrowAnnotation = null;
  //   return;
  // }

  // arrowAnnotation.rel2Annotation = _hoverAnnotation;
  arrowAnnotation.save();

  console.log('aaaaaaaaa:', arrowAnnotation.rel1Annotation);

  showTextInput2();

  // dragging = false;

  // cancelArrow();

  // let svg = findSVGAtPoint(e.clientX, e.clientY);
  // if (!svg) {
  //   console.log('not found svg.');
  //   return;
  // }

  // // End point.
  // endBoundingCircle = hitBoundingCircle;

  // // Check valid.
  // if (!endBoundingCircle) {
  //   return console.log('not specified end point.');
  // }
  // if (!startBoundingCircle) {
  //   return console.log('not specified start point.');
  // }
  // if (startBoundingCircle === endBoundingCircle) {
  //   return console.log('start/end are same.');
  // }

  // // Create annotation.
  // let startPos = {
  //   x: parseFloat(startBoundingCircle.getAttribute('cx')),
  //   y: parseFloat(startBoundingCircle.getAttribute('cy'))
  // };
  // let endPos = {
  //   x: parseFloat(endBoundingCircle.getAttribute('cx')),
  //   y: parseFloat(endBoundingCircle.getAttribute('cy'))    
  // }
  // let annotation = {
  //   x1: startPos.x,
  //   y1: startPos.y,
  //   x2: endPos.x,
  //   y2: endPos.y,
  //   type : 'arrow',
  //   direction : _arrowType,
  //   rel1 : startBoundingCircle.parentNode.getAttribute('data-pdf-annotate-id'),
  //   rel2 : endBoundingCircle.parentNode.getAttribute('data-pdf-annotate-id'),
  // };

  // let { documentId, pageNumber } = getMetadata(svg);
  // PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation)
  //   .then((annotation) => {
  //     let arrow = appendChild(svg, annotation);

  //     let arrowId = annotation.uuid;

  //     // add text input.
  //     let s = scaleUp(svg, startPos);
  //     let e = scaleUp(svg, endPos);
  //     showTextInput(s, e, annotation);
  //   });
}

function showTextInput2() {

  let p1 = arrowAnnotation.rel1Annotation.getBoundingCirclePosition();
  let p2 = arrowAnnotation.rel2Annotation.getBoundingCirclePosition();
  let textPosition = getRelationTextPosition(null, p1.x, p1.y, p2.x, p2.y);

  let boundingRect = svg.getBoundingClientRect();

  let x = scaleUp(svg, {x : textPosition.x}).x + boundingRect.left;
  let y = scaleUp(svg, {y : textPosition.y}).y + boundingRect.top;




  // let textPosition = getRelationTextPosition(svg, p1.x, p1.y, p2.x, p2.y);

  // console.log('textPosition:', textPosition);

  addInputField(x, y, null, null, (text) => {

    if (!text) {
      return;
    }

    arrowAnnotation.text = text;
    arrowAnnotation.save();
    arrowAnnotation.render();

    // let svg = getSVGLayer();
    // let { documentId, pageNumber } = getMetadata(svg);

    // // FIXME: cannot stop refarence counter. I wanna use the original `annotation`, but couldn't.
    // PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, arrowAnnotation.uuid).then(arrowAnnotation => {

    //   // Set relation between arrow and text.
    //   arrowAnnotation.text = textAnnotation.uuid;

    //   // Update.
    //   // let element = document.querySelector('.annotationLayer');
    //   let element = document.getElementById('annoLayer'); // TODO make it const.
    //   let documentId = element.getAttribute('data-pdf-annotate-document');  // 共通化
    //   PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, arrowAnnotation.uuid, arrowAnnotation);

    //   // Update UI.
    //   console.log('arrow:', $(`[data-pdf-annotate-id="${arrowAnnotation.uuid}"]`));
    //   $(`[data-pdf-annotate-id="${arrowAnnotation.uuid}"]`).attr('data-text', textAnnotation.uuid);

    // });


  }, 'text');
}

// function showTextInput(start, end, arrowAnnotation) {

//   let textPosition = getRelationTextPosition(svg, start.x, start.y, end.x, end.y);

//   addInputField(textPosition.x, textPosition.y, null, null, (textAnnotation) => {

//     if (!textAnnotation) {
//       return;
//     }

//     let svg = getSVGLayer();
//     let { documentId, pageNumber } = getMetadata(svg);

//     // FIXME: cannot stop refarence counter. I wanna use the original `annotation`, but couldn't.
//     PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, arrowAnnotation.uuid).then(arrowAnnotation => {

//       // Set relation between arrow and text.
//       arrowAnnotation.text = textAnnotation.uuid;

//       // Update.
//       // let element = document.querySelector('.annotationLayer');
//       let element = document.getElementById('annoLayer'); // TODO make it const.
//       let documentId = element.getAttribute('data-pdf-annotate-document');  // 共通化
//       PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, arrowAnnotation.uuid, arrowAnnotation);

//       // Update UI.
//       console.log('arrow:', $(`[data-pdf-annotate-id="${arrowAnnotation.uuid}"]`));
//       $(`[data-pdf-annotate-id="${arrowAnnotation.uuid}"]`).attr('data-text', textAnnotation.uuid);

//     });


//   });
// }

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

  svg = getSVGLayer();

  // svg = document
  //             .querySelector('#pageContainer' + PDFView.page)
  //             .querySelector('svg');

  // svg = document.getElementById('annoLayer'); // TODO make it const.

  // Collect boundingCircles for highlight.
  boundingCircles = [];
  forEach.call(svg.querySelectorAll('g > [type="boundingCircle"]'), boundingCircle => {
    if ($(boundingCircle).closest('g').attr('read-only') !== 'true') {
      boundingCircles.push(boundingCircle);
    // } else {
    //   $(boundingCircle).hide();
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

function handleBoundingCircleHoverIn(annotation) {
  console.log('handleBoundingCircleHoverIn');

  _hoverAnnotation = annotation;
}

function handleBoundingCircleHoverOut(annotation) {
  console.log('handleBoundingCircleHoverOut');

  _hoverAnnotation = null;
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

  // document.addEventListener('mouseup', handleDocumentMouseup);
  document.addEventListener('mousedown', handleDocumentMousedown);
  // document.addEventListener('mousemove', handleDocumentMousemove);

  window.annotationContainer.getAllAnnotations().forEach(a => {

    if (a.readOnly) {
      a.hideBoundingCircle();

    } else {
      a.on('circlehoverin', handleBoundingCircleHoverIn);
      a.on('circlehoverout', handleBoundingCircleHoverOut);
    }

  });

}

/**
 * Disable arrow behavior.
 */
export function disableArrow() {
  if (!_enabled) { return; }

  _enabled = false;
  // document.removeEventListener('mouseup', handleDocumentMouseup);
  document.removeEventListener('mousedown', handleDocumentMousedown);
  // document.removeEventListener('keyup', handleDocumentKeyup);
  // document.removeEventListener('mousemove', handleDocumentMousemove);

  enableUserSelect();
  enableTextlayer();

  deleteBoundingBoxes();  

  window.annotationContainer.getAllAnnotations().forEach(a => {

    if (a.readOnly) {
      a.showBoundingCircle();

    } else {
      a.removeListener('circlehoverin', handleBoundingCircleHoverIn);
      a.removeListener('circlehoverout', handleBoundingCircleHoverOut);
    }

  });

}

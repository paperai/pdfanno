import $ from 'jquery';
import PDFJSAnnotate from '../PDFJSAnnotate';
import {
  disableUserSelect,
  enableUserSelect,
  findSVGAtPoint,
  getMetadata,
  scaleDown,
  scaleUp
} from './utils';
import { addInputField } from './text';
import RectAnnotation from '../annotation/rect';


let filter  = Array.prototype.filter;
let forEach = Array.prototype.forEach;

let _enable = false;

const OPACITY_VISIBLE = 1;
const OPACITY_TRANSLUCENT = 0.5;

let monitoringRects = [];   // rect
let monitoringTexts = [];   // textbox
let monitoringArrows = [];  // arrow
let monitoringCircles = []; // boundingCircle for highlight.

let rects = [];

let hitComponent = null;

let rectDraggingWillStart = false;
let rectDragging = false;
let rectDraggingComponent = null;
let rectDraggingStartPos = null;

function handleDoubleClick(e) {

    let component = findHitElement(e, true);
    if (component && isTextComponent(component)) {

        console.log('aaaaaaaaaaaaaaa');

        // Add text input filed.
        let svg = findSVGAtPoint(e.clientX, e.clientY);
        let pos = scaleUp(svg, {
            x : parseFloat(component.getAttribute('x')),
            y : parseFloat(component.getAttribute('y'))
        });
        let rect = svg.getBoundingClientRect();
        pos.x += rect.left;
        pos.y += rect.top;
        let id = component.parentNode.getAttribute('data-pdf-annotate-id');
        let text = component.parentNode.querySelector('text').textContent;
        addInputField(pos.x, pos.y, id, text, () => {
            // wait for save finished, and enable.
            setTimeout(()=> {
                enableViewMode();
            }, 500);
        });

        // Remove current text from data.
        let { documentId, pageNumber } = getMetadata(svg);
        let annotationId = component.parentNode.getAttribute('data-pdf-annotate-id');
        deleteAnnotation(documentId, [annotationId]);

        // Remove from UI.
        $(component).closest('g').remove();

        // disable
        disableViewMode();
    }

}

function handleDocumentMouseup(e) {

    // Save rect position if dragging ended.
    if (rectDragging) {

        console.log('handleDocumentMouseup:rectDragging');

        let svg = findSVGAtPoint(e.clientX, e.clientY);
        if (svg) {
            moveRectComponent(svg, rectDraggingStartPos, getClientXY(e), rectDraggingComponent);
            
            // Update annotation, and save it.
            let { documentId, pageNumber } = getMetadata(svg);
            let annotationId = rectDraggingComponent.parentNode.getAttribute('data-pdf-annotate-id');
            PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, annotationId).then(annotation => {
              annotation.x = parseFloat(rectDraggingComponent.getAttribute('x'));
              annotation.y = parseFloat(rectDraggingComponent.getAttribute('y'));
              PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotationId, annotation);
            });            
        }

        // Reset.
        rectDragging = false;
        rectDraggingWillStart = false;
        enableUserSelect();

        return;
    }

    rectDraggingWillStart = false;

    // Set component state to selected if exists.
    let element = findHitElement(e, true);
    if (element) {
        let g = element.parentNode;
        if (g.getAttribute('data-selected') === 'true') {
            g.setAttribute('data-selected', false);
            setSelectedVisibility(element, 'hide');
        } else {
            g.setAttribute('data-selected', true);
            setSelectedVisibility(element, 'show');
        }
    }
}

function handleDocumentMousedown(e) {

    // Start rect dragging if exists.
    let component = findHitElement(e, true);
    if (component && isRectComponent(component)) {
        rectDraggingWillStart = true;
        rectDraggingComponent = component;
        let x = rectDraggingComponent.getAttribute('x');
        let y = rectDraggingComponent.getAttribute('y');
        rectDraggingComponent.setAttribute('data-original-x', x);
        rectDraggingComponent.setAttribute('data-original-y', y);
        rectDraggingStartPos = getClientXY(e);
    }
}

function handleDocumentMousemove(e) {

    // Drag a rect if now dragging.
    if (rectDraggingWillStart) {
        rectDraggingWillStart = false;
        rectDragging = true;
        disableUserSelect();
    }
    if (rectDragging) {
        let svg = findSVGAtPoint(e.clientX, e.clientY);
        if (svg) {
            moveRectComponent(svg, rectDraggingStartPos, getClientXY(e), rectDraggingComponent);            
        }
        return;
    }


    // Set component state to visible if exists.
    let element = findHitElement(e);
    if (element) {
        if (!hitComponent) {
            hitComponent = element;
            setVisibility(hitComponent, OPACITY_VISIBLE);
        }
    } else {
        if (hitComponent) {
            setVisibility(hitComponent, OPACITY_TRANSLUCENT);
            hitComponent = null;
        }
    }
}

function handleDocumentKeydown(e) {
    console.log('handleDocumentKeydown')
    // Delete or BackSpace.
    if (e.keyCode == 46 || e.keyCode == 8) {
        e.preventDefault();
        return false;
    }
}

function handleDocumentKeyup(e) {
    // Delete or BackSpace.
    if (e.keyCode == 46 || e.keyCode == 8) {
        deleteSelectedAnnotations();
        e.preventDefault();
        return false;
    }
}

function handleRectMove(e) {
    console.log('handleRectMove:', e, e.detail);
}

function handleRectMoveEnd(e) {
    console.log('handleRectMoveEnd:', e, e.detail);
}

function moveRectComponent(svg, startPos, currentPos, rect) {

    let diff = scaleDown(svg, {
        x : startPos.x - currentPos.x,
        y : startPos.y - currentPos.y
    });

    let originalX = parseFloat(rect.getAttribute('data-original-x'));
    let originalY = parseFloat(rect.getAttribute('data-original-y'));

    rect.setAttribute('x', originalX - diff.x);
    rect.setAttribute('y', originalY - diff.y);

    // Move related text.
    // let textId = $(rect).parents('g').data('text');
    // let $text = $(`[data-pdf-annotate-id="${textId}"]`);
    // if (!$text.data('original-x')) {
    //     $text.data('original-x', $text.)
    // }

}



/**
 * Delete annotations selected.
 */
function deleteSelectedAnnotations() {

    // New type.
    window.annotationContainer.getAllAnnotations().forEach(r => {
        r.deleteSelectedAnnotation();
    });

    let annotationIds = [];
    let documentId = document.querySelector('svg').getAttribute('data-pdf-annotate-document');

    forEach.call(document.querySelectorAll('svg [data-selected="true"]'), g => {

        // Delete it.
        let annotationId = g.getAttribute('data-pdf-annotate-id');
        annotationIds.push(annotationId);
        g.parentNode.removeChild(g);

        // Delete relations.

        let type = g.getAttribute('data-pdf-annotate-type');

        if (type === 'arrow') {
            let criteria = {
                type : 'arrow',
                uuid : annotationId
            };
            PDFJSAnnotate.getStoreAdapter().findAnnotations(documentId, criteria).then(annotations => {
                if (annotations.length > 0) {
                    annotationIds.push(annotations[0].text);
                }
                deleteAnnotation(documentId, annotationIds, initializeMonitoringAnnotations);
            });
        
        } else if (type === 'textbox') {
            let criteria = {
                type : 'arrow',
                text : annotationId
            };
            PDFJSAnnotate.getStoreAdapter().findAnnotations(documentId, criteria).then(annotations => {
                if (annotations.length > 0) {
                    annotationIds.push(annotations[0].uuid);
                }
                deleteAnnotation(documentId, annotationIds, initializeMonitoringAnnotations);
            });

        } else if (type === 'highlight') {
            // Span text.
            let textId = $(g).attr('data-text');
            if (textId) {
                annotationIds.push(textId);
            }
            // Arrow relations.
            let criteria = {
                type       : 'arrow',
                rel1 : annotationId
            };
            PDFJSAnnotate.getStoreAdapter().findAnnotations(documentId, criteria).then(annotations => {
                if (annotations.length > 0) {
                    annotationIds.push(annotations[0].uuid);
                    annotationIds.push(annotations[0].text);
                }
                let criteria = {
                    type : 'arrow',
                    rel2 : annotationId
                };
                PDFJSAnnotate.getStoreAdapter().findAnnotations(documentId, criteria).then(annotations => {
                    if (annotations.length > 0) {
                        annotationIds.push(annotations[0].uuid);
                        annotationIds.push(annotations[0].text);
                    }
                    deleteAnnotation(documentId, annotationIds, initializeMonitoringAnnotations);
                });
            });
            

        
        } else {
            deleteAnnotation(documentId, annotationIds, initializeMonitoringAnnotations);
        }
    });
}

function deleteAnnotation(documentId, ids, callback) {
    if (ids.length === 0) {
        return callback && callback();
    }
    let annotationId = ids.shift();
    PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, annotationId).then(() => {
        deleteAnnotation(documentId, ids);
    }).catch(() => {
        deleteAnnotation(documentId, ids);
    });

    let element = document.querySelector(`[data-pdf-annotate-id="${annotationId}"]`);
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function setSelectedVisibility(component, state) {

    console.log('setSelectedVisibility:', component);
    
    let $g = $(component.tagName.toLowerCase() === 'g' ? component : component.parentNode);

    // For highlight, rect, text, arrow.
    if (state === 'show') {
        $g.find('rect,path').addClass('--selected');
    } else {
        $g.find('rect,path').removeClass('--selected');
    }

}

function setVisibility(component, opacity) {
    setComponentVisibility(component, opacity);
}

function isHighlightComponent(component) {
    if (component.tagName.toLowerCase() === 'g') {
        return component.getAttribute('data-pdf-annotate-type') === 'highlight';
    }
    return component.parentNode
        && component.parentNode.getAttribute('data-pdf-annotate-type') === 'highlight';
}

function isRectComponent(component) {
    if (component.tagName.toLowerCase() === 'g') {
        return component.getAttribute('data-pdf-annotate-type') === 'area';
    }
    return component.parentNode
        && component.parentNode.getAttribute('data-pdf-annotate-type') === 'area';
}

function isTextComponent(component) {
    if (component.tagName.toLowerCase() === 'g') {
        return component.getAttribute('data-pdf-annotate-type') === 'textbox';
    }
    return component.parentNode
        && component.parentNode.getAttribute('data-pdf-annotate-type') === 'textbox';
}

function isArrowComponent(component) {
    if (component.tagName.toLowerCase() === 'g') {
        return component.getAttribute('data-pdf-annotate-type') === 'arrow';
    }
    return component.parentNode
        && component.parentNode.getAttribute('data-pdf-annotate-type') === 'arrow';
}


function setComponentVisibility(component, opacity) {
    console.log('setComponentVisibility', component.tagName, opacity);

    // let g = (component.tagName.toLowerCase() === 'g' ? component : component.parentNode);
    let g;
    if (component.tagName.toLowerCase() === 'g') {
        g = component;
    } else {
        g = $(component).parents('g[data-pdf-annotate-id]')[0];
    }

    g.style.opacity = opacity;

    if (!g.parentNode) {
        return;
    }

    // For circle.
    if (opacity === OPACITY_VISIBLE) {
        $(g).find('circle').addClass('--hover');
    } else {
        $(g).find('circle').removeClass('--hover');
    }

    // For highlight, rect.
    if (opacity === OPACITY_VISIBLE) {
        $(g).find('rect').addClass('--hover');
    } else {
        $(g).find('rect').removeClass('--hover');
    }

    // For Arrow.
    if (opacity === OPACITY_VISIBLE) {
        $(g).find('path').addClass('--hover');
    } else {
        $(g).find('path').removeClass('--hover');
    }

    // Also set to relation items.
    let documentId = g.parentNode.getAttribute('data-pdf-annotate-document');
    let uuid = g.getAttribute('data-pdf-annotate-id');
    let type = g.getAttribute('data-pdf-annotate-type');

    if (type === 'arrow') {
        [
            g.getAttribute('data-rel1'),
            g.getAttribute('data-rel2'),
            g.getAttribute('data-text')
        ].forEach(id => {
            let element = document.querySelector(`g[data-pdf-annotate-id="${id}"]`);
            if (element) {
                element.style.opacity = opacity;
            }
        });
        
    } else if (type === 'highlight' || type === 'textbox' || type === 'area') {
        PDFJSAnnotate.getStoreAdapter().getAnnotations(documentId, null).then(({documentId, pageNumber, annotations}) => {
            let arrowAnnotations = annotations.filter(annotation => {
                return annotation.rel1 === uuid
                        || annotation.rel2 === uuid
                        || annotation.text === uuid
            });
            arrowAnnotations.forEach(arrowAnnotation => {
                let arrowElement = document.querySelector(`g[data-pdf-annotate-id="${arrowAnnotation.uuid}"]`);
                setComponentVisibility(arrowElement, opacity);
            });
        });

        if (type === 'highlight') {
            let textId = $(g).attr('data-text');
            if (textId) {
                let $g = $(`g[data-pdf-annotate-id="${textId}"]`);
                if (opacity === OPACITY_VISIBLE) {
                    $g.find('rect').addClass('--hover');
                    $g.css('opacity', opacity);
                } else {
                    $g.find('rect').removeClass('--hover');
                    $g.css('opacity', opacity);
                }
            }

        }
    }
}

function findHitElement(e, canEdit=false) {

    let svg = findSVGAtPoint(e.clientX, e.clientY);
    if (!svg) {
        return null;
    }

    // Mouse Point.
    let point = scaleDown(svg, getClientXY(e));

    // highlight.
    for (let i = 0; i < monitoringCircles.length; i++) {
        if (isHit(point, monitoringCircles[i], 'boundingCircle')) {
            if (canEdit) {
                let readOnly = $(monitoringCircles[i]).closest('g').attr('read-only') === 'true';
                if (!readOnly) {
                    return monitoringCircles[i];
                }
            } else {
                return monitoringCircles[i];                
            }
        }
    }

    // rect.
    for (let i = 0; i < monitoringRects.length; i++) {
        if (isHit(point, monitoringRects[i], 'rect')) {
            if (canEdit) {
                let readOnly = $(monitoringRects[i]).closest('g').attr('read-only') === 'true';
                if (!readOnly) {
                    return monitoringRects[i];
                }
            } else {
                return monitoringRects[i];                
            }
        }
    }

    // textbox.
    for (let i = 0; i < monitoringTexts.length; i++) {
        if (isHit(point, monitoringTexts[i], 'text')) {
            if (canEdit) {
                let readOnly = $(monitoringTexts[i]).closest('g').attr('read-only') === 'true';
                if (!readOnly) {
                    return monitoringTexts[i];
                }
            } else {
                return monitoringTexts[i];                
            }
        }
    }

    // arrow.
    for (let i = 0; i < monitoringArrows.length; i++) {
        if (isHit(point, monitoringArrows[i], 'arrow')) {
            if (canEdit) {
                let readOnly = $(monitoringArrows[i]).closest('g').attr('read-only') === 'true';
                if (!readOnly) {
                    return monitoringArrows[i];
                }
            } else {
                return monitoringArrows[i];                
            }
        }
    }
}

function isHit(pos, element, type) {

    if (type === 'boundingCircle') {
        let r = parseFloat(element.getAttribute('r'));
        let x = parseFloat(element.getAttribute('cx'));
        let y = parseFloat(element.getAttribute('cy'));
        let distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
        return distance <= r;        
    }

    if (type === 'rect') {
        let top    = parseFloat(element.getAttribute('y'));
        let bottom = top + parseFloat(element.getAttribute('height'));
        let left   = parseFloat(element.getAttribute('x'));
        let right  = left + parseFloat(element.getAttribute('width'));

        let x = pos.x;
        let y = pos.y;
        return (
            // left
            ((left-2) <= x && x <= (left+2) && top <= y && y <= bottom)
            // right
            || ((right-2) <= x && x <= (right+2) && top <= y && y <= bottom)
            // top
            || (left <= x && x <= right && (top-2) <= y && y <= (top+2))
            // bottom
            || (left <= x && x <= right && (bottom-2) <= y && y <= (bottom+2))
        );
        // return left <= pos.x && pos.x <= right && top <= pos.y && pos.y <= bottom;        
    }

    if (type === 'text') {
        let top    = parseFloat(element.getAttribute('y'));
        let bottom = top + parseFloat(element.getAttribute('height'));
        let left   = parseFloat(element.getAttribute('x'));
        let right  = left + parseFloat(element.getAttribute('width'));
        return left <= pos.x && pos.x <= right && top <= pos.y && pos.y <= bottom;        
    }

    if (type === 'arrow') {

        // Judge using triangle in-out.

        // test.
        let d = element.getAttribute('d').split(' ');
        // d: `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
        // M 400.12120426203285 88.13763102725366 Q 318.94806886179947 118.75219077638972 277.05534651364843 194.7214542557652
        let x1 = parseFloat(d[1]);
        let y1 = parseFloat(d[2]);
        let x2 = parseFloat(d[6]);
        let y2 = parseFloat(d[7]);
        let x3 = parseFloat(d[4]);
        let y3 = parseFloat(d[5]);

        let vecAB = {
            x : x1 - x2,
            y : y1 - y2
        };
        let vecBP = {
            x : x2 - pos.x,
            y : y2 - pos.y
        };

        let vecBC = {
            x : x2 - x3,
            y : y2 - y3
        };
        let vecCP = {
            x : x3 - pos.x,
            y : y3 - pos.y
        };

        let vecCA = {
            x : x3 - x1,
            y : y3 - y1
        };
        let vecAP = {
            x : x1 - pos.x,
            y : y1 - pos.y
        };

        let c1 = vecAB.x * vecBP.y - vecAB.y * vecBP.x;
        let c2 = vecBC.x * vecCP.y - vecBC.y * vecCP.x;
        let c3 = vecCA.x * vecAP.y - vecCA.y * vecAP.x;

        return (c1 > 0 && c2 > 0 && c3 > 0) || (c1 < 0 && c2 < 0 && c3 < 0);
    }
}

function getClientXY(e) {
  let svg = findSVGAtPoint(e.clientX, e.clientY);
  if (!svg) {
    return null;
  }
  let rect = svg.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  return {x, y};
}

function initializeMonitoringAnnotations() {
    
    monitoringRects = [];
    monitoringTexts = [];
    monitoringArrows = [];
    monitoringCircles = [];

    // Components for monitoring.
    forEach.call(document.querySelectorAll('svg > g > [type="boundingCircle"]'), boundingCircle => {
        monitoringCircles.push(boundingCircle);
    });
    // Texts.
    forEach.call(document.querySelectorAll('svg > [data-pdf-annotate-type="textbox"] > rect'), rect => {
        if (rect.parentNode.getAttribute('data-pdf-annotate-id') !== 'undefined') {
            console.log('bbbbbbb:', rect.parentNode.getAttribute('data-pdf-annotate-id'));
            monitoringTexts.push(rect);            
        }
    });
    // Arrows.
    forEach.call(document.querySelectorAll('svg > [data-pdf-annotate-type="arrow"] > path'), path => {
        monitoringArrows.push(path);
    });
    // // Highlights.
    // forEach.call(document.querySelectorAll('svg > [data-pdf-annotate-type="highlight"] > rect'), rect => {
    //     monitoringRects.push(rect);
    // });


    // Rects.
    // let rects = window.annotationContainer.getAllAnnotations().filter(a => {
    //     return a.type === 'area';
    // });
    // rects.forEach(r => {
    //     r.enableViewMode();
    // });

    window.annotationContainer.getAllAnnotations().forEach(r => {
        r.enableViewMode();
        r.on('rectmove', handleRectMove);
        r.on('rectmoveend', handleRectMoveEnd);
    });



}

function enableMouseListening() {

    initializeMonitoringAnnotations();

    document.addEventListener('mousedown', handleDocumentMousedown);
    document.addEventListener('mousemove', handleDocumentMousemove);
    document.addEventListener('mouseup', handleDocumentMouseup);
    document.addEventListener('keyup', handleDocumentKeyup);
    document.addEventListener('keydown', handleDocumentKeydown);
    document.addEventListener('dblclick', handleDoubleClick);
}

function disableMouseListening() {
    console.log('disableMouseListening');

    monitoringRects = [];
    monitoringArrows = [];
    monitoringCircles = [];

    window.annotationContainer.getAllAnnotations().forEach(r => {
        r.disableViewMode();
        r.removeListener('rectmove', handleRectMove);
        r.removeListener('rectmoveend', handleRectMoveEnd);
    });

    document.removeEventListener('mousedown', handleDocumentMousedown);
    document.removeEventListener('mousemove', handleDocumentMousemove);
    document.removeEventListener('mouseup', handleDocumentMouseup);
    document.removeEventListener('keyup', handleDocumentKeyup);
    document.removeEventListener('keydown', handleDocumentKeydown);
    document.removeEventListener('dblclick', handleDoubleClick);
}

function setComponenTranslucent(opacity) {
    forEach.call(document.querySelectorAll('svg > *'), svgComponent => {
        svgComponent.style.opacity = opacity;
    });
}

export function enableViewMode() {
    console.log('enableViewMode');
    
    if (_enable) {
        return;
    }
    _enable = true;

    enableMouseListening();
    setComponenTranslucent(OPACITY_TRANSLUCENT);

    // FIXME
    // window.addEventListener('rectmove', this.handleRectMove);
    // window.addEventListener('rectmoveend', this.handleRectMoveEnd);
}
export function disableViewMode() {
    console.log('disableViewMode');

    if (!_enable) {
        return;
    }
    _enable = false;

    disableMouseListening();
    setComponenTranslucent(OPACITY_VISIBLE);

    // FIXME
    // window.removeEventListener('rectmove', this.handleRectMove);
    // window.removeEventListener('rectmoveend', this.handleRectMoveEnd);
}
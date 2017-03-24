import $ from 'jquery';
import assign from 'deep-assign';
import PDFAnnoCore from '../PDFAnnoCore';
import appendChild from '../render/appendChild';
import {
  BORDER_COLOR,
  disableUserSelect,
  enableUserSelect,
  getMetadata,
  scaleDown,
  scaleUp,
  getXY,
  getSVGLayer,
  getTmpLayer,
  getCurrentPage,
  disableTextlayer,
  enableTextlayer
} from './utils';
import { addInputField } from './text';
import RectAnnotation from '../annotation/rect';

/**
 * the prev annotation rendered at the last.
 */
let prevAnnotation;

const _type = 'area';

let _enabled = false;
let overlay;
let originY;
let originX;

let enableArea = {
  page : 0,
  minX : 0,
  maxX : 0,
  minY : 0,
  maxY : 0
};

let mousedownFired = false;
let mousemoveFired = false;

/**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousedown(e) {

  mousedownFired = true;

  let { x, y } = getXY(e);
  originX = x;
  originY = y;

  enableArea = getCurrentPage(e);
  if (!enableArea) {
    return;
  }

  overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = `${originY}px`;
  overlay.style.left = `${originX}px`;
  overlay.style.width = 0;
  overlay.style.height = 0;
  overlay.style.border = `2px solid ${BORDER_COLOR}`;
  overlay.style.boxSizing = 'border-box';
  overlay.style.visibility = 'visible';
  getTmpLayer().appendChild(overlay);

}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousemove(e) {

  if (!overlay) {
    return;
  }

  if (mousedownFired) {
    mousemoveFired = true;
  }

  let { x : curX, y : curY } = getXY(e);

  let x = Math.min(originX, curX);
  let y = Math.min(originY, curY);
  let w = Math.abs(originX - curX);
  let h = Math.abs(originY - curY);

  // Restrict in page.
  x = Math.min(enableArea.maxX, Math.max(enableArea.minX, x));
  y = Math.min(enableArea.maxY, Math.max(enableArea.minY, y));
  if (x > enableArea.minX) {
    w = Math.min(w, enableArea.maxX - x);
  } else {
    w = originX - enableArea.minX;
  }
  if (y > enableArea.minY) {
    h = Math.min(h, enableArea.maxY - y);
  } else {
    h = originY - enableArea.minY;
  }

  // Move and Resize.
  overlay.style.left   = x + 'px';
  overlay.style.top    = y + 'px';
  overlay.style.width  = w + 'px';
  overlay.style.height = h + 'px';

  if (prevAnnotation) {
    prevAnnotation.resetTextForceDisplay();
    prevAnnotation.render();
    prevAnnotation.enableViewMode();
    prevAnnotation = null;
  }

}

function _findAnnotation(e) {

    const { x, y } = scaleDown(getSVGLayer(), getXY(e));

    let hitAnnotation = null;
    window.annotationContainer.getAllAnnotations().forEach(a => {
        if (a.isHit(x, y)) {
            hitAnnotation = a;
        } else if (a.isHitText(x, y)) {
            hitAnnotation = a.textAnnotation;
        }
    });

    console.log('hit:', hitAnnotation);

    return hitAnnotation;
}

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {

    let clicked = mousedownFired && !mousemoveFired;
    let dragged = mousedownFired && mousemoveFired;

    if (clicked) {

        let anno = _findAnnotation(e);
        if (anno) {
            anno.handleClickEvent();
        }

        $(overlay).remove();
        overlay = null;

        return;
    }

    mousedownFired = false;
    mousemoveFired = false;


  if (!overlay) {
    return;
  }

  const rect = {
    x      : parseInt(overlay.style.left, 10),
    y      : parseInt(overlay.style.top, 10),
    width  : parseInt(overlay.style.width, 10),
    height : parseInt(overlay.style.height, 10)
  };

  if (rect.width > 0 && rect.height > 0) {
    saveRect(rect);
  }

  $(overlay).remove();
  overlay = null;

  // document.removeEventListener('mousemove', handleDocumentMousemove);
}

/**
 * Save a rect annotation.
 *
 * @param {Object} rect - The rect to use for annotation.
 */
function saveRect(rect) {

  if (rect.width === 0 || rect.height === 0) {
    return;
  }


  let svg = getSVGLayer();

  let annotation = assign(scaleDown(svg, rect), {
    type : _type
  });

  // Save.
  let rectAnnotation = RectAnnotation.newInstance(annotation);
  rectAnnotation.save();

  // Render.
  rectAnnotation.render();

  // Add an input field.
  let x = annotation.x;
  let y = annotation.y - 20; // 20 = circle'radius(3px) + input height(14px) + α
  let boundingRect = svg.getBoundingClientRect();

  x = scaleUp(svg, {x}).x + boundingRect.left;
  y = scaleUp(svg, {y}).y + boundingRect.top;

  addInputField(x, y, null, null, (text) => {

    if (!text) {
      return;
    }

    rectAnnotation.text = text;
    rectAnnotation.setTextForceDisplay();
    rectAnnotation.render();
    rectAnnotation.save();
    rectAnnotation.enableViewMode();

  });

  // if (prevAnnotation) {
  //   prevAnnotation.resetTextForceDisplay();
  //   prevAnnotation.render();
  // }
  prevAnnotation = rectAnnotation;

  // Enable a drag / click action.
  // TODO インスタンス生成時にデフォルトで有効にしてもいいかなー.
  rectAnnotation.enableViewMode();

}

/**
 * Cancel rect drawing if an existing rect has got a drag event.
 */
function cancelRectDrawing() {

    // After `handleDocumentMousedown`
    setTimeout(() => {
        console.log('cancelRectDrawing');
        // document.removeEventListener('mousemove', handleDocumentMousemove);
        $(overlay).remove();
        overlay = null;
    }, 100);

}

// // TODO 共通化？
// function disableTextlayer() {
//   $('body').addClass('disable-text-layer');
// }
// // TODO 共通化？
// function enableTextlayer() {
//   $('body').removeClass('disable-text-layer');
// }


/**
 * Enable rect behavior
 */
export function enableRect() {

    disableRect();

    window.currentType = 'rect';

  // if (_enabled) { return; }

  _enabled = true;
  document.addEventListener('mouseup', handleDocumentMouseup);
  document.addEventListener('mousedown', handleDocumentMousedown);
  document.addEventListener('mousemove', handleDocumentMousemove);

  // disableUserSelect();
  disableTextlayer();

  window.globalEvent.on('rectmovestart', cancelRectDrawing);
}

/**
 * Disable rect behavior
 */
export function disableRect() {

    window.currentType = null;

  // if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mouseup', handleDocumentMouseup);
  document.removeEventListener('mousedown', handleDocumentMousedown);
  document.removeEventListener('mousemove', handleDocumentMousemove);

  // enableUserSelect();
  enableTextlayer();

  if (prevAnnotation) {
    prevAnnotation.resetTextForceDisplay();
    prevAnnotation.render();
    prevAnnotation.enableViewMode();
    prevAnnotation = null;
  }

  window.globalEvent.removeListener('rectmovestart', cancelRectDrawing);

}

import $ from 'jquery';
import assign from 'deep-assign';
import PDFAnnoCore from '../PDFAnnoCore';
import {
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
import * as textInput from '../utils/textInput';

const _type = 'area';

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
  overlay.style.border = `2px solid #00BFFF`; // Blue.
  overlay.style.boxSizing = 'border-box';
  overlay.style.visibility = 'visible';
  overlay.style.pointerEvents = 'none';
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

    $(document.body).addClass('no-action');

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

    $(document.body).removeClass('no-action');

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

  // Enable a drag / click action.
  // TODO インスタンス生成時にデフォルトで有効にしてもいいかなー.
  rectAnnotation.enableViewMode();

  // Deselect all annotations.
  window.annotationContainer
      .getSelectedAnnotations()
      .forEach(a => a.deselect());

  // Select.
  rectAnnotation.select();

  // Enable input label.
  textInput.enable({ uuid : rectAnnotation.uuid, autoFocus : true });

}

/**
 * Cancel rect drawing if an existing rect has got a drag event.
 */
function cancelRectDrawing() {

    // After `handleDocumentMousedown`
    setTimeout(() => {
        console.log('cancelRectDrawing');
        $(overlay).remove();
        overlay = null;
    }, 100);

}

/**
 * Enable rect behavior
 */
export function enableRect() {

    disableRect();

    window.currentType = 'rect';

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

    console.log('disableRect');

    window.currentType = null;

  document.removeEventListener('mouseup', handleDocumentMouseup);
  document.removeEventListener('mousedown', handleDocumentMousedown);
  document.removeEventListener('mousemove', handleDocumentMousemove);

  // enableUserSelect();
  enableTextlayer();

  window.globalEvent.removeListener('rectmovestart', cancelRectDrawing);

}

import $ from 'jquery';
import assign from 'deep-assign';
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
  getSVGLayer,
  getViewerContainer,
  getTmpLayer,
  getCurrentPage
} from './utils';
import { addInputField } from './text';
import RectAnnotation from '../annotation/rect';

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

/**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousedown(e) {

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
  
  document.addEventListener('mousemove', handleDocumentMousemove);
}

/**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMousemove(e) {

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

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {
  
  if (!overlay) {
    return;
  }

  saveRect({
    x      : parseInt(overlay.style.left, 10),
    y      : parseInt(overlay.style.top, 10),
    width  : parseInt(overlay.style.width, 10),
    height : parseInt(overlay.style.height, 10)
  });

  $(overlay).remove();
  overlay = null;

  document.removeEventListener('mousemove', handleDocumentMousemove);
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

  let { documentId, pageNumber } = getMetadata(svg);

  // Save.
  let rectAnnotation = RectAnnotation.newInstance(annotation);
  rectAnnotation.save();
  // window.annotationContainer.add(rectAnnotation); // TODO move to annotation#save. Make container as SetObject.

  // Render.
  rectAnnotation.render();


  // TODO Use annotation#save.
  // PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation).then((annotation) => {

  //   console.log('bbbbbbbbb:', annotation);

  //   // appendChild(svg, annotation);

  //   let rectAnnotation = RectAnnotation.newInstance(annotation);
  //   rectAnnotation.render();
  //   window.annotationContainer.add(rectAnnotation);    

    // Add an input field.
    let x = annotation.x;
    let y = annotation.y - 20; // 20 = circle'radius(3px) + input height(14px) + α
    let boundingRect = svg.getBoundingClientRect();

    x = scaleUp(svg, {x}).x + boundingRect.left;
    y = scaleUp(svg, {y}).y + boundingRect.top;

    addInputField(x, y, null, null, (text) => {

      console.log('text: ', text);

      if (!text) {
        return;
      }

      // annotation.text = text;

      rectAnnotation.text = text;
      rectAnnotation.render();
      rectAnnotation.save();


      // Create a text annotation.
      // $(`[data-pdf-annotate-id="${annotation.uuid}"]`).remove();
      // TODO
      // let $elmenet = appendChild(svg, annotation);

      // Update data.
      // PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotation.uuid, annotation);


      // rectAnnotation.text = text;
      // rectAnnotation.render();


      // Save and Update.


      // // Move the text into the rect svg group.
      // let $text = $(`[data-pdf-annotate-id="${textAnnotation.uuid}"]`);
      // $(`[data-pdf-annotate-id="${annotation.uuid}"]`).append($text.children());
      // $text.remove();
      // // Delete text annotation.
      // PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, textAnnotation.uuid);

      // 設計変更
      // =================================
      // ラベルアノテーションは、いろんなアノテーションに付属する感じ。
      // 各種アノテーションを追加したのちに、インプットフィールドを用意。
      // 入力が終わったら、annotationではなく、テキスト文字自体をコールバックに戻すようにする。
      // 受け取った値をDBに保存し、またレンダリングも行う（自身のアノテーションのg内に）。


      // これが良さそうだったら、ハイライト、arrow、にも設計を展開する。


      // // FIXME: cannot stop refarence counter. I wanna use the original `annotation`, but couldn't.
      // PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, annotation.uuid).then(annotation => {

      //   // Set relation between arrow and text.
      //   annotation.text = textAnnotation.uuid;

      //   // Update data.
      //   PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotation.uuid, annotation);

      //   // Update UI.
      //   $(`[data-pdf-annotate-id="${annotation.uuid}"]`).attr('data-text', textAnnotation.uuid);

      // });

    }, 'text');

  // });
}

/**
 * Enable rect behavior
 */
export function enableRect() {
  
  if (_enabled) { return; }

  _enabled = true;
  document.addEventListener('mouseup', handleDocumentMouseup);
  document.addEventListener('mousedown', handleDocumentMousedown);

  disableUserSelect();
}

/**
 * Disable rect behavior
 */
export function disableRect() {
  
  if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mouseup', handleDocumentMouseup);
  document.removeEventListener('mousedown', handleDocumentMousedown);

  enableUserSelect();
}

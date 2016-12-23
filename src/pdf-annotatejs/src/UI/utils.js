import $ from 'jquery';
import createStyleSheet from 'create-stylesheet';

export const BORDER_COLOR = '#00BFFF';

const userSelectStyleSheet = createStyleSheet({
  body: {
    '-webkit-user-select': 'none',
       '-moz-user-select': 'none',
        '-ms-user-select': 'none',
            'user-select': 'none'
  }
});
userSelectStyleSheet.setAttribute('data-pdf-annotate-user-select', 'true');

/**
 * Find the SVGElement that contains all the annotations for a page
 *
 * @param {Element} node An annotation within that container
 * @return {SVGElement} The container SVG or null if it can't be found
 */
export function findSVGContainer(node) {
  let parentNode = node;

  while ((parentNode = parentNode.parentNode) &&
          parentNode !== document) {
    if (parentNode.nodeName.toUpperCase() === 'SVG' &&
        parentNode.getAttribute('data-pdf-annotate-container') === 'true') {
      return parentNode;
    }
  }

  return null;
}

/**
 * Find an SVGElement container at a given point
 *
 * @param {Number} x The x coordinate of the point
 * @param {Number} y The y coordinate of the point
 * @return {SVGElement} The container SVG or null if one can't be found
 */
export function findSVGAtPoint(x, y) {

  // TODO make it a global const.
  const svgLayerId = 'annoLayer';

  let el = document.getElementById(svgLayerId);
  if (!el) {
    return;
  }

  let rect = el.getBoundingClientRect();

  if (pointIntersectsRect(x, y, rect)) {

    return el;
  }

  return null;


  // let elements = document.querySelectorAll('svg[data-pdf-annotate-container="true"]');

  // for (let i=0, l=elements.length; i<l; i++) {
  //   let el = elements[i];
  //   let rect = el.getBoundingClientRect();

  //   if (pointIntersectsRect(x, y, rect)) {

  //     return el;
  //   }
  // }

  // return null;
}

/**
 * Find an Element that represents an annotation at a given point
 *
 * @param {Number} x The x coordinate of the point
 * @param {Number} y The y coordinate of the point
 * @return {Element} The annotation element or null if one can't be found
 */
export function findAnnotationAtPoint(x, y) {
  let svg = findSVGAtPoint(x, y);
  if (!svg) { return; }
  let elements = svg.querySelectorAll('[data-pdf-annotate-type]');

  // Find a target element within SVG
  for (let i=0, l=elements.length; i<l; i++) {
    let el = elements[i];
    if (pointIntersectsRect(x, y, getOffsetAnnotationRect(el))) {   
      return el;
    }
  }

  return null;
}

/**
 * Determine if a point intersects a rect
 *
 * @param {Number} x The x coordinate of the point
 * @param {Number} y The y coordinate of the point
 * @param {Object} rect The points of a rect (likely from getBoundingClientRect)
 * @return {Boolean} True if a collision occurs, otherwise false
 */
export function pointIntersectsRect(x, y, rect) {
  return y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right;
}

/**
 * Get the rect of an annotation element accounting for offset.
 *
 * @param {Element} el The element to get the rect of
 * @return {Object} The dimensions of the element
 */
export function getOffsetAnnotationRect(el) {
  let rect = getAnnotationRect(el);
  let { offsetLeft, offsetTop } = getOffset(el);
  return {
    top: rect.top + offsetTop,
    left: rect.left + offsetLeft,
    right: rect.right + offsetLeft,
    bottom: rect.bottom + offsetTop
  };
}

/**
 * Get the rect of an annotation element.
 *
 * @param {Element} el The element to get the rect of
 * @return {Object} The dimensions of the element
 */
export function getAnnotationRect(el) {
  let h = 0, w = 0, x = 0, y = 0;
  let rect = el.getBoundingClientRect();
  // TODO this should be calculated somehow
  const LINE_OFFSET = 16;

  switch (el.nodeName.toLowerCase()) {
    case 'path':
    let minX, maxX, minY, maxY;

    el.getAttribute('d').replace(/Z/, '').split('M').splice(1).forEach((p) => {
      var s = p.split(' ').map(i => parseInt(i, 10));

      if (typeof minX === 'undefined' || s[0] < minX) { minX = s[0]; }
      if (typeof maxX === 'undefined' || s[2] > maxX) { maxX = s[2]; }
      if (typeof minY === 'undefined' || s[1] < minY) { minY = s[1]; }
      if (typeof maxY === 'undefined' || s[3] > maxY) { maxY = s[3]; }
    });

    h = maxY - minY;
    w = maxX - minX;
    x = minX;
    y = minY;
    break;

    case 'line':
    h = parseInt(el.getAttribute('y2'), 10) - parseInt(el.getAttribute('y1'), 10);
    w = parseInt(el.getAttribute('x2'), 10) - parseInt(el.getAttribute('x1'), 10);
    x = parseInt(el.getAttribute('x1'), 10);
    y = parseInt(el.getAttribute('y1'), 10);

    if (h === 0) {
      h += LINE_OFFSET;
      y -= (LINE_OFFSET / 2);
    }
    break;

    case 'text':
    h = rect.height;
    w = rect.width;
    x = parseInt(el.getAttribute('x'), 10);
    y = parseInt(el.getAttribute('y'), 10) - h;
    break;

    case 'g':
    let { offsetLeft, offsetTop } = getOffset(el);
    h = rect.height;
    w = rect.width;
    x = rect.left - offsetLeft;
    y = rect.top - offsetTop;

    if (el.getAttribute('data-pdf-annotate-type') === 'strikeout') {
      h += LINE_OFFSET;
      y -= (LINE_OFFSET / 2);
    }
    break;

    case 'rect':
    case 'svg':
    h = parseInt(el.getAttribute('height'), 10);
    w = parseInt(el.getAttribute('width'), 10);
    x = parseInt(el.getAttribute('x'), 10);
    y = parseInt(el.getAttribute('y'), 10);
    break;
  }

  // Result provides same properties as getBoundingClientRect
  let result = {
    top: y,
    left: x,
    width: w,
    height: h,
    right: x + w,
    bottom: y + h
  };

  // For the case of nested SVG (point annotations) and grouped
  // lines or rects no adjustment needs to be made for scale.
  // I assume that the scale is already being handled
  // natively by virtue of the `transform` attribute.
  if (!['svg', 'g'].includes(el.nodeName.toLowerCase())) {
    result = scaleUp(findSVGAtPoint(rect.left, rect.top), result);
  }

  return result;
}

/**
 * Adjust scale from normalized scale (100%) to rendered scale.
 *
 * @param {SVGElement} svg The SVG to gather metadata from
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled up
 */
export function scaleUp(svg, rect) {
  let result = {};
  let { viewport } = getMetadata(svg);

  Object.keys(rect).forEach((key) => {
    result[key] = rect[key] * viewport.scale;
  });

  return result;
}

/**
 * Adjust scale from rendered scale to a normalized scale (100%).
 *
 * @param {SVGElement} svg The SVG to gather metadata from
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled down
 */
export function scaleDown(svg, rect) {
  let result = {};
  let { viewport } = getMetadata(svg);

  Object.keys(rect).forEach((key) => {
    result[key] = rect[key] / viewport.scale;
  });

  return result;
}

/**
 * Get the scroll position of an element, accounting for parent elements
 *
 * @param {Element} el The element to get the scroll position for
 * @return {Object} The scrollTop and scrollLeft position
 */
export function getScroll(el) {
  let scrollTop = 0;
  let scrollLeft = 0;
  let parentNode = el;

  while ((parentNode = parentNode.parentNode) &&
          parentNode !== document) {
    scrollTop += parentNode.scrollTop;
    scrollLeft += parentNode.scrollLeft;
  }

  return { scrollTop, scrollLeft };
}

/**
 * Get the offset position of an element, accounting for parent elements
 *
 * @param {Element} el The element to get the offset position for
 * @return {Object} The offsetTop and offsetLeft position
 */
export function getOffset(el) {
  let parentNode = el;

  while ((parentNode = parentNode.parentNode) &&
          parentNode !== document) {
    if (parentNode.nodeName.toUpperCase() === 'SVG') {
      break;
    }
  }

  let rect = parentNode.getBoundingClientRect();

  return { offsetLeft: rect.left, offsetTop: rect.top };
}

/**
 * Disable user ability to select text on page
 */
export function disableUserSelect() {
  if (!userSelectStyleSheet.parentNode) {
    document.head.appendChild(userSelectStyleSheet);
  }
}


/**
 * Enable user ability to select text on page
 */
export function enableUserSelect() {
  if (userSelectStyleSheet.parentNode) {
    userSelectStyleSheet.parentNode.removeChild(userSelectStyleSheet);
  }
}

/**
 * Get the metadata for a SVG container
 *
 * @param {SVGElement} svg The SVG container to get metadata for
 */
export function getMetadata(svg) {
  return {
    documentId: svg.getAttribute('data-pdf-annotate-document'),
    pageNumber: parseInt(svg.getAttribute('data-pdf-annotate-page'), 10),
    viewport: JSON.parse(svg.getAttribute('data-pdf-annotate-viewport'))
  };
}

export function getXY(e) {

  let rect1 = $('#pageContainer1')[0].getBoundingClientRect();
  // console.log('rect1:', rect1);
  let rect2 = $('#annoLayer')[0].getBoundingClientRect();
  // console.log('rect2:', rect2);

  let rectTop = rect2.top - rect1.top;
  let rectLeft = rect2.left - rect1.left;
  // console.log(rectTop, rectLeft);

  // let x = e.clientX - rect.left;
  // let y = $('#annoLayer').scrollTop() + e.clientY - rect.top;

  // let x = e.clientX - rect.left;
  // let y = e.clientY + $('#annoLayer').scrollTop() - rect.top;
  // let y = e.clientY + $('#annoLayer').scrollTop();
  // let y = e.clientY + $('#annoLayer').scrollTop() - rectTop;
  let y = e.clientY + $('#annoLayer').scrollTop() - rect2.top;

  // let x = e.clientX - rect.left;
  // let x = e.clientX;
  // let x = e.clientX - rectLeft;
  let x = e.clientX - rect2.left;
  // let y = e.clientY - rect.top;

  // console.log('e.client:', e.clientX, e.clientY, $('#annoLayer').scrollTop());

  // console.log('y:', y, e.clientY, $('#annoLayer').scrollTop(), rect2.top);

  return { x, y }
}

export function getSVGLayer() {
  return document.getElementById('annoLayer');
}

export function getViewerContainer() {
  // return document.getElementById('viewerContainer');
  return document.getElementById('pageContainer1');
}

export function getTmpLayer() {
  return document.getElementById('tmpLayer');
}

export function getCurrentPage(e) {

  let { x, y } = getXY(e);

  let scrollTop = $('#annoLayer')[0].getBoundingClientRect().top;
  let scrollLeft = $('#annoLayer')[0].getBoundingClientRect().left;

  // let elements = document.querySelectorAll('.page');
  let elements = document.querySelectorAll('.canvasWrapper');

  for (let i = 0, l = elements.length; i < l; i++) {
    let el = elements[i];
    let rect = el.getBoundingClientRect();

    let pageNumber = i + 1;

    // rect.top = $('#annoLayer').scrollTop();
    // 927
    let minX = rect.left - scrollLeft;
    let maxX = rect.right - scrollLeft;
    let minY = rect.top - scrollTop;// + 9 * pageNumber;    // 9 = margin
    let maxY = rect.bottom - scrollTop;// + 9 * pageNumber;

    if (minX <= x && x <= maxX && minY <= y && y <= maxY) {

      let page = parseInt(el.parentNode.id.replace('pageContainer', ''));

      console.log('find!!!!', page);
      // console.log('x', minX <= x && x <= maxX, minX, x, maxX);
      // console.log('y', minY <= y && y <= maxY, minY, y, maxY);

      return { page, minX, maxX, minY, maxY };
    }


    // if (pointIntersectsRect(x, y, rect)) {

    //   console.log('find!!!', el, rect);

    //   return el;
    // }
  }

  console.log('notfound ><...');
  return null;



  // TODO
  return 1;
}
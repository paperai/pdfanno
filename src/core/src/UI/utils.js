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
 * Adjust scale from normalized scale (100%) to rendered scale.
 *
 * @param {SVGElement} svg The SVG to gather metadata from
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled up
 */
export function scaleUp(svg, rect) {

  if (arguments.length === 1) {
    rect = svg;
    svg = getSVGLayer();
  }

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

  if (arguments.length === 1) {
    rect = svg;
    svg = getSVGLayer();
  }

  let result = {};
  let { viewport } = getMetadata(svg);

  Object.keys(rect).forEach((key) => {
    result[key] = rect[key] / viewport.scale;
  });

  return result;
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
 * Disable all text layers.
 */
export function disableTextlayer() {
  $('body').addClass('disable-text-layer');
}

/**
 * Enable all text layers.
 */
export function enableTextlayer() {
  $('body').removeClass('disable-text-layer');
}

/**
 * Get the metadata for a SVG container
 *
 * @param {SVGElement} svg The SVG container to get metadata for
 */
export function getMetadata(svg) {
  svg = svg || getSVGLayer();
  return {
    documentId: svg.getAttribute('data-pdf-annotate-document'),
    pageNumber: parseInt(svg.getAttribute('data-pdf-annotate-page'), 10),
    viewport: JSON.parse(svg.getAttribute('data-pdf-annotate-viewport'))
  };
}

export function getXY(e) {

  let rect1 = $('#pageContainer1')[0].getBoundingClientRect();
  let rect2 = $('#annoLayer')[0].getBoundingClientRect();

  let rectTop = rect2.top - rect1.top;
  let rectLeft = rect2.left - rect1.left;

  let y = e.clientY + $('#annoLayer').scrollTop() - rect2.top;
  let x = e.clientX - rect2.left;

  return { x, y }
}

export function getSVGLayer() {
  return document.getElementById('annoLayer');
}

export function getTmpLayer() {
  return document.getElementById('tmpLayer');
}

export function getCurrentPage(e) {

  let { x, y } = getXY(e);

  let scrollTop = $('#annoLayer')[0].getBoundingClientRect().top;
  let scrollLeft = $('#annoLayer')[0].getBoundingClientRect().left;

  let elements = document.querySelectorAll('.canvasWrapper');

  for (let i = 0, l = elements.length; i < l; i++) {
    let el = elements[i];
    let rect = el.getBoundingClientRect();

    let pageNumber = i + 1;

    let minX = rect.left - scrollLeft;
    let maxX = rect.right - scrollLeft;
    let minY = rect.top - scrollTop;
    let maxY = rect.bottom - scrollTop;

    if (minX <= x && x <= maxX && minY <= y && y <= maxY) {

      let page = parseInt(el.parentNode.id.replace('pageContainer', ''));

      return { page, minX, maxX, minY, maxY };
    }

  }

  console.log('notfound ><...');
  return null;
}

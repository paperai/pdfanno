import setAttributes from '../utils/setAttributes';
import renderCircle from './renderCircle';
import { DEFAULT_RADIUS } from './renderCircle';

import renderText from './renderText';

/**
 * Create SVGRectElements from an annotation definition.
 * This is used for anntations of type `area`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement|SVGRectElement} A group of all rects to be rendered
 */
export default function renderRect(a, svg) {

  let color = a.color || '#f00';

  let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('read-only', a.readOnly === true);
  group.style.visibility = 'visible';

  let rect = createRect(a);
  setAttributes(rect, {
    stroke      : color,
    strokeWidth : 1,
    fill        : 'none',
    class       : 'anno-rect'
  });
  group.appendChild(rect);

  let circle = renderCircle({
    x    : a.x,
    y    : a.y - DEFAULT_RADIUS - 2,
    type : 'boundingCircle'
  });
  group.appendChild(circle);

  return group;
}

function createRect(r) {

  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  setAttributes(rect, {
    x      : r.x,
    y      : r.y,
    width  : r.width,
    height : r.height
  });

  return rect;
}

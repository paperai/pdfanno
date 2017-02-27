import uuid from '../utils/uuid';
import setAttributes from '../utils/setAttributes';
import renderCircle from './renderCircle';
import { DEFAULT_RADIUS } from './renderCircle';

import renderText from './renderText';

/**
 * Create SVGRectElements from an annotation definition.
 * This is used for anntations of type `span`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement|SVGRectElement} A group of all rects to be rendered
 */
export default function renderSpan(a, svg) {

  let color = a.color || '#FF0';

  let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('read-only', a.readOnly === true);
  group.setAttribute('data-text', a.text);
  group.classList.add('anno-span');

  a.rectangles.forEach((r) => {
    let rect = createRect(r);
    rect.setAttribute('fill-opacity', 0.2);
    rect.setAttribute('fill', color);
    rect.classList.add('anno-span');
    group.appendChild(rect);
  });

  let rect = a.rectangles[0];
  let circle = renderCircle({
    x    : rect.x,
    y    : rect.y - DEFAULT_RADIUS,
    type : 'boundingCircle'
  });
  group.style.visibility = 'visible';
  group.appendChild(circle);

  return group;

}


function createRect(r) {

  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  setAttributes(rect, {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height
  });

  return rect;
}

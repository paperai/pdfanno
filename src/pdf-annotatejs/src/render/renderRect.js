import setAttributes from '../utils/setAttributes';
import normalizeColor from '../utils/normalizeColor';
import renderCircle from './renderCircle';
import { DEFAULT_RADIUS } from './renderCircle';

/**
 * Create SVGRectElements from an annotation definition.
 * This is used for anntations of type `area` and `highlight`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement|SVGRectElement} A group of all rects to be rendered
 */
export default function renderRect(a) {

  if (a.type === 'highlight') {
    return createHighlight(a);

  } else {
    return createRectBox(a);
  }
}

function createHighlight(a) {

  let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  a.rectangles.forEach((r) => {
    let rect = createRect(r);
    rect.setAttribute('fill-opacity', 0.2);
    rect.setAttribute('fill', normalizeColor(a.color || '#ff0'));
    rect.classList.add('anno-highlight');
    group.appendChild(rect);
  });

  let rect = a.rectangles[0];
  let circle = renderCircle({
    x    : rect.x,
    y    : rect.y - DEFAULT_RADIUS,
    type : 'boundingCircle'
  });
  group.appendChild(circle);

  return group;
}

function createRectBox(a) {

  let rect = createRect(a);
  setAttributes(rect, {
    stroke: normalizeColor(a.color || '#f00'),
    strokeWidth: 1,
    fill: 'none',
    class : 'anno-rect'
  });

  let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.appendChild(rect);

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

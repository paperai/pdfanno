import setAttributes from '../utils/setAttributes';

let forEach = Array.prototype.forEach;

export const DEFAULT_RADIUS = 3;

/**
 * Create SVGLineElements from an annotation definition.
 * This is used for anntations of type `circle`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement} A group of all lines to be rendered
 */
export default function renderCircle(a) {

  let {x, y} = adjustPoint(a.x, a.y, a.r || DEFAULT_RADIUS);

  // <circle cx="100" cy="100" r="100"/>
  let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  setAttributes(circle, {
    cx: x,
    cy: y,
    r: a.r || DEFAULT_RADIUS,
    fill : 'blue'
  });
  if (a.type) {
    circle.setAttribute('type', a.type);
  }

  circle.classList.add('anno-circle');

  return circle;
}

function adjustPoint(x, y, radius) {

  // Avoid overlapping.
  let circles = document.querySelectorAll('svg [type="boundingCircle"]');

  while(true) {

    let good = true;
    forEach.call(circles, circle => {
      let x1 = parseFloat(circle.getAttribute('cx'));
      let y1 = parseFloat(circle.getAttribute('cy'));
      let r1 = parseFloat(circle.getAttribute('r'));

      let distance1 = Math.pow(x - x1, 2) + Math.pow(y - y1, 2);
      let distance2 = Math.pow(radius + r1, 2);
      if (distance1 < distance2) {
        good = false;
      }
    });

    if (good) {
      break;
    }
    y -= 1;
  }

  return {x, y};
}

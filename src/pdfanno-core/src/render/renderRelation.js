import setAttributes from '../utils/setAttributes';
import renderCircle, { DEFAULT_RADIUS } from './renderCircle';
import { findBezierControlPoint } from '../utils/relation.js';

let secondaryColor = ['green', 'blue', 'purple'];

/**
 * Create SVGGElements from an annotation definition.
 * This is used for anntations of type `relation`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGGElement} A group of a relation to be rendered
 */
export default function renderRelation(a) {

    let relation = createRelation(a);
    return relation;
}

export function createRelation(a, id=null) {

  let color = a.color;
  if (!color) {
    if (a.readOnly) {
      color = secondaryColor[a.seq % secondaryColor.length];
    } else {
      color = '#F00';
    }
  }

  // Adjust the start/end points.
  let theta = Math.atan((a.y1-a.y2) / (a.x1-a.x2));
  let sign = (a.x1 < a.x2 ? 1 : -1);
  a.x1 += DEFAULT_RADIUS * Math.cos(theta) * sign;
  a.x2 -= DEFAULT_RADIUS * Math.cos(theta) * sign;
  a.y1 += DEFAULT_RADIUS * Math.sin(theta) * sign;
  a.y2 -= DEFAULT_RADIUS * Math.sin(theta) * sign;


// <svg viewBox="0 0 200 200">
//     <marker id="m_ar" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="strokeWidth" preserveAspectRatio="none" markerWidth="2" markerHeight="3" orient="auto-start-reverse">
//         <polygon points="0,0 0,10 10,5" fill="red" id="ms"/>
//     </marker>
//     <path d="M50,50 h100" fill="none" stroke="black" stroke-width="10" marker-start="url(#m_ar)" marker-end="url(#m_ar)"/>
// </svg>

  let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  setAttributes(group, {
    fill        : color,
    stroke      : color,
    'data-rel1' : a.rel1,
    'data-rel2' : a.rel2,
    'data-text' : a.text
  });
  group.style.visibility = 'visible';
  group.setAttribute('read-only', a.readOnly === true);

  let marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  setAttributes(marker, {
    viewBox: "0 0 10 10",
    markerWidth: 2,
    markerHeight: 3,
    fill: color,
    id: 'relationhead',
    orient: "auto-start-reverse"
  });
  marker.setAttribute('refX', 5);
  marker.setAttribute('refY', 5);
  group.appendChild(marker);

  let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  setAttributes(polygon, {
    points: "0,0 0,10 10,5"
  });
  marker.appendChild(polygon);

  // Find Control points.
  let control = findBezierControlPoint(a.x1, a.y1, a.x2, a.y2);



  // Create Outline.
  let outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  setAttributes(outline, {
    d     : `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
    class : 'anno-relation-outline'
  });
  group.appendChild(outline);


  /*
    <path d="M 25 25 Q 175 25 175 175" stroke="blue" fill="none"/>
  */
  let relation = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  setAttributes(relation, {
    d           : `M ${a.x1} ${a.y1} Q ${control.x} ${control.y} ${a.x2} ${a.y2}`,
    stroke      : color,
    strokeWidth : 1,
    fill        : 'none',
    class       : 'anno-relation'
  });

  // Triangle for the end point.
  if (a.direction === 'one-way' || a.direction === 'two-way') {
    relation.setAttribute('marker-end', 'url(#relationhead)');
  }

  // Triangle for the start point.
  if (a.direction === 'two-way') {
    relation.setAttribute('marker-start', 'url(#relationhead)');
  }

  if (id) {
    setAttributes(relation, { id : id });
  }

  group.appendChild(relation);

  return group;
}

function adjustStartEndPoint(annotation) {

  // TODO
  const RADIUS = 5;

  let x1 = annotation.x1;
  let y1 = annotation.y1;
  let x2 = annotation.x2;
  let y2 = annotation.y2;

  function sign(val) {
    return val >= 0 ? 1 : -1;
  }

  // Verticale.
  if (x1 === x2) {
    annotation.y2 += RADIUS * sign(y1 - y2);
    return annotation;
  }

  // Horizonal.
  if (y1 === y2) {
    annotation.x2 += RADIUS * sign(x1 - x2);
    return annotation;
  }

  let grad  = (y1-y2) / (x1-x2);
  let theta = Math.atan(grad);
  annotation.x2 += RADIUS * Math.cos(theta) * sign(x1 - x2);
  annotation.y2 += RADIUS * Math.sin(theta) * sign(y1 - y2);
  return annotation;

}

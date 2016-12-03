import setAttributes from '../utils/setAttributes';
import normalizeColor from '../utils/normalizeColor';
import renderCircle from './renderCircle';
import { DEFAULT_RADIUS } from './renderCircle';

const PADDING = 0;


function getRect(text, svg) {
    svg.appendChild(text);
    let rect = text.getBoundingClientRect();
    text.parentNode.removeChild(text);
    return rect;
}



/**
 * Create SVGTextElement from an annotation definition.
 * This is used for anntations of type `textbox`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGTextElement} A text to be rendered
 */
export default function renderText(a, svg) {

    // Text.
    let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    setAttributes(text, {
        x: a.x,
        y: a.y + parseInt(a.size, 10),
        fill: normalizeColor(a.color || '#FF0000'),
        fontSize: a.size
    });
    text.innerHTML = a.content;

    // Background.
    let box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    let rect = getRect(text, svg);
    setAttributes(box, {
      x: a.x - PADDING,
      y: a.y - PADDING,
      width: rect.width + PADDING*2,
      height: rect.height + PADDING*2,
      fill: '#FFFFFF',
      // fillOpacity: 0.9
      class : 'anno-text'
    });

    // Bounding circle.
    // let circle = renderCircle({
    //   x: a.x,
    //   y: a.y - DEFAULT_RADIUS,
    //   type: 'boundingCircle'
    // });

    // Group.
    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.appendChild(box);
    group.appendChild(text);
    // group.appendChild(circle);
    return group;
}

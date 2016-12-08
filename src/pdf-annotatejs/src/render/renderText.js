import setAttributes from '../utils/setAttributes';
import normalizeColor from '../utils/normalizeColor';
import renderCircle from './renderCircle';
import { DEFAULT_RADIUS } from './renderCircle';

const PADDING = 0;

let textSecondaryColor = ['green', 'blue', 'yellow'];


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

    let color;
    if (a.readOnly) {
      color = textSecondaryColor[a.seq % textSecondaryColor.length];
    } else {
      color = '#F00';
    }

    // Text.
    let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    setAttributes(text, {
        x: a.x,
        y: a.y + parseInt(a.size, 10),
        fill: color,
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
      class : 'anno-text'
    });

    // Group.
    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.appendChild(box);
    group.appendChild(text);
    return group;
}

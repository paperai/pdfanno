import { renderRect } from './renderRect'
import { renderSpan } from './renderSpan'
import renderText from './renderText'
import { renderRelation } from './renderRelation'

/**
 * Transform the rotation and scale of a node using SVG's native transform attribute.
 *
 * @param {Node} node The node to be transformed
 * @param {Object} viewport The page's viewport data
 * @return {Node}
 */
function transform (node, viewport) {
  node.style.transform = `scale(${viewport.scale})`
  return node
}

/**
 * Append an annotation as a child of an SVG.
 *
 * @param {Element} base element to append the annotation to
 * @param {Object} annotation The annotation definition to render and append
 * @param {Object} viewport The page's viewport data
 * @return {SVGElement} A node that was created and appended by this function
 */
export default function appendAnnoChild (base, annotation, viewport) {
  // TODO no need third argument(viewport) ?
  if (!viewport) {
    viewport = window.PDFView.pdfViewer.getPageView(0).viewport
  }

  let child
  switch (annotation.type) {
  case 'rectangle':
    child = renderRect(annotation, base)
    break
  case 'span':
    child = renderSpan(annotation, base)
    break
  case 'textbox':
    child = renderText(annotation, base)
    break
  case 'relation':
    child = renderRelation(annotation, base)
    break
  }

  // If no type was provided for an annotation it will result in node being null.
  // Skip appending/transforming if node doesn't exist.
  if (child) {

    let elm = transform(child, viewport)

    if (annotation.type === 'textbox') {
      base.appendChild(elm)

      // `text` show above other type elements.
    } else {
      base.append(elm)
    }
  }
  return child
}

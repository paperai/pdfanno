import * as textInput from '../utils/textInput'
import RelationAnnotation from '../annotation/relation'

/**
 *
 * @param {String} type
 * @param {SpanAnnotation} anno1
 * @param {SpanAnnotation} anno2
 * @param {String} text
 * @param {*} color
 * @param {Boolean} main
 */
function relation (type, anno1, anno2, text, color) {
  let annotation = new RelationAnnotation()
  annotation.direction = type
  annotation.rel1Annotation = anno1
  annotation.rel2Annotation = anno2
  annotation.page = anno1.page
  annotation.text = text
  annotation.color = color
  annotation.main = true
  return annotation
}

/**
 * Create a new Relation annotation.
 */
export function createRelation ({ type, anno1, anno2, text, color }) {
  // TODO No need?
  // for old style.
  if (arguments.length === 3) {
    type = arguments[0]
    anno1 = arguments[1]
    anno2 = arguments[2]
  }

  let isCrossPage = false
  if (anno1.page !== anno2.page) {
    isCrossPage = true
  }

  let annotation = []
  annotation[0] = relation(type, anno1, anno2, text, color)

  if (isCrossPage) {
    annotation[1] = annotation[0].createSubRelation()
  }

  for (let anno of annotation) {
    anno.save()
    anno.render()
    anno.enableViewMode()
  }

  // TODO Refactoring.
  // TODO 適切な場所に移動する.
  // Deselect all.
  window.annotationContainer
    .getSelectedAnnotations()
    .forEach(a => a.deselect())

  // Select.
  for (let anno of annotation) {
    anno.select()
  }

  // New type text.
  textInput.enable({ uuid : annotation.uuid, autoFocus : true, text })

  return annotation
}

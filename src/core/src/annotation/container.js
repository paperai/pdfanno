import { uuid } from 'anno-ui/src/utils'
import { ANNO_VERSION, PDFEXTRACT_VERSION } from '../version'
import { toTomlString, fromTomlString } from '../utils/tomlString'
import { dispatchWindowEvent } from '../utils/event'
import { convertToExportY } from '../../../shared/coords'
import SpanAnnotation from './span'
import RectAnnotation from './rect'
import RelationAnnotation from './relation'

/**
 * Annotation Container.
 */
export default class AnnotationContainer {

  /**
   * Constructor.
   */
  constructor () {
    this.set = new Set()
  }

  /**
   * Add an annotation to the container.
   */
  add (annotation) {
    this.set.add(annotation)
    dispatchWindowEvent('annotationUpdated')
  }

  /**
   * Remove the annotation from the container.
   */
  remove (annotation) {
    this.set.delete(annotation)
    dispatchWindowEvent('annotationUpdated')
  }

  /**
   * Remove all annotations.
   */
  destroy () {
    console.log('AnnotationContainer#destroy')
    this.set.forEach(a => a.destroy())
    this.set = new Set()
  }

  /**
   * Get all annotations from the container.
   */
  getAllAnnotations () {
    let list = []
    this.set.forEach(a => list.push(a))
    return list
  }

  /**
   * Get annotations which user select.
   */
  getSelectedAnnotations () {
    return this.getAllAnnotations().filter(a => a.selected)
  }

  /**
   * Find an annotation by the id which an annotation has.
   */
  findById (uuid) {
    uuid = String(uuid) // `uuid` must be string.
    let annotation = null
    this.set.forEach(a => {
      if (a.uuid === uuid) {
        annotation = a
      }
    })
    return annotation
  }

  /**
   * Change the annotations color, if the text is the same in an annotation.
   *
   * annoType : span, one-way, two-way, link
   */
  changeColor ({ text, color, uuid, annoType }) {
    console.log('changeColor: ', text, color, uuid)
    if (uuid) {
      const a = this.findById(uuid)
      if (a) {
        a.color = color
        a.render()
        a.enableViewMode()
      }
    } else {
      this.getAllAnnotations()
        .filter(a => a.text === text)
        .filter(a => {
          if (annoType === 'span') {
            return a.type === annoType
          } else if (annoType === 'one-way' || annoType === 'two-way' || annoType === 'link') {
            if (a.type === 'relation' && a.direction === annoType) {
              return true
            }
          }
          return false
        }).forEach(a => {
          a.color = color
          a.render()
          a.enableViewMode()
        })
    }
  }

  setColor (colorMap) {
    console.log('setColor:', colorMap)
    Object.keys(colorMap).forEach(annoType => {
      if (annoType === 'default') {
        return
      }
      Object.keys(colorMap[annoType]).forEach(text => {
        const color = colorMap[annoType][text]
        this.changeColor({ text, color, annoType })
      })
    })
  }

  /**
   * Export annotations as a TOML string.
   */
  exportData ({exportType = 'toml'} = {}) {

    return new Promise((resolve, reject) => {

      let dataExport = {}

      // Set version.
      dataExport.version = ANNO_VERSION
      dataExport['pdfextract-version'] = PDFEXTRACT_VERSION

      // Only writable.
      const annos = this.getAllAnnotations().filter(a => !a.readOnly)

      // Sort by create time.
      // This reason is that a relation need start/end annotation ids which are numbered at export.
      annos.sort((a1, a2) => a1.createdAt - a2.createdAt)

      // The ID for specifing an annotation on a TOML file.
      // This ID is sequential.
      let id = 0

      // Create export data.
      annos.forEach(annotation => {

        // Increment to next.
        id++

        // Span.
        if (annotation.type === 'span') {
          if (!dataExport['spans']) {
            dataExport['spans'] = []
          }
          dataExport['spans'].push(annotation.export(id))
          // Save temporary for relation.
          annotation.exportId = id

        // Relation.
        } else if (annotation.type === 'relation') {
          if (!dataExport['relations']) {
            dataExport['relations'] = []
          }
          dataExport['relations'].push(annotation.export())
        }
      })

      // Remove exportId.
      annos.forEach(annotation => {
        delete annotation.exportId
      })

      if (exportType === 'json') {
        resolve(dataExport)
      } else {
        resolve(toTomlString(dataExport))
      }
    })
  }

  /**
   * Import annotations.
   */
  importAnnotations (data, isPrimary) {

    const readOnly = !isPrimary
    const colorMap = data.colorMap

    function getColor (index, type, text) {
      let color = colorMap.default
      if (colorMap[type] && colorMap[type][text]) {
        color = colorMap[type][text]
      }
      return color
    }

    return new Promise((resolve, reject) => {

      // Delete old ones.
      this.getAllAnnotations()
        .filter(a => a.readOnly === readOnly)
        .forEach(a => a.destroy())

      // Add annotations.
      data.annotations.forEach((tomlString, i) => {

        // Create a object from TOML string.
        let tomlObject = fromTomlString(tomlString)
        if (!tomlObject) {
          return
        }

        for (const key in tomlObject) {

          let d = tomlObject[key]

          // Skip if the content is not object, like version string.
          if (typeof d !== 'object') {
            continue
          }

          d.uuid = uuid()
          d.readOnly = readOnly

          if (d.type === 'span') {

            let span = SpanAnnotation.newInstanceFromTomlObject(d)
            span.color = getColor(i, span.type, span.text)
            span.save()
            span.render()
            span.enableViewMode()

            // Rect.
          } else if (d.type === 'rect') {

            let rect = RectAnnotation.newInstanceFromTomlObject(d)
            rect.color = getColor(i, rect.type, rect.text)
            rect.save()
            rect.render()
            rect.enableViewMode()

            // Relation.
          } else if (d.type === 'relation') {

            d.rel1 = tomlObject[d.ids[0]].uuid
            d.rel2 = tomlObject[d.ids[1]].uuid
            let relation = RelationAnnotation.newInstanceFromTomlObject(d)
            relation.color = getColor(i, relation.direction, relation.text)
            relation.save()
            relation.render()
            relation.enableViewMode()

          } else {
            console.log('Unknown: ', key, d)
          }
        }
      })

      // Done.
      resolve(true)
    })
  }
}

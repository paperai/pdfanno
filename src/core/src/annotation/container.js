import { uuid } from 'anno-ui/src/utils'
import { ANNO_VERSION, PDFEXTRACT_VERSION } from '../version'
import { toTomlString, fromTomlString } from '../utils/tomlString'
import SpanAnnotation from './span'
import RectAnnotation from './rect'
import RelationAnnotation from './relation'
import * as Utils from '../../../shared/util'
import semver from 'semver'
import Ajv from 'ajv'

/**
 * Annotation Container.
 */
export default class AnnotationContainer {
  /**
   * Constructor.
   */
  constructor () {
    this.set = new Set()
    this.ajv = new Ajv({
      allErrors : true
    })
    this.validate = this.ajv.compile(require('../../../../schemas/pdfanno-schema.json'))
  }

  /**
   * Add an annotation to the container.
   */
  add (annotation) {
    this.set.add(annotation)
    Utils.dispatchWindowEvent('annotationUpdated')
  }

  /**
   * Remove the annotation from the container.
   */
  remove (annotation) {
    this.set.delete(annotation)
    Utils.dispatchWindowEvent('annotationUpdated')
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
   *
   */
  clearRenderingStates (filter = () => true) {
    if (typeof filter === 'function') {
      this.getAllAnnotations().filter(filter).forEach(a => a.setRenderingInitial())
    }
  }

  /**
   *
   */
  clearPage (page) {
    this.clearRenderingStates(a => {
      if (a.type === 'span' || a.type === 'rectangle') {
        // console.log('clearPage.span.rectangle', page)
        return a.page === page
      } else if (a.type === 'relation') {
        if (a.visible(page)) {
          ;[a._rel1Annotation, a._rel2Annotation].forEach(s => s.setRenderingInitial())
          // console.log('clearPage.rel', a._rel1Annotation.page, a._rel2Annotation.page)
          return true
        }
      }
      return false
    })
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
    console.log('changeColor: ', text, color, uuid, annoType)
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
          if (annoType === 'span' || annoType === 'rectangle') {
            return a.type === annoType
          } else if (annoType === 'relation') {
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
      dataExport.pdfanno = ANNO_VERSION
      dataExport.pdfextract = PDFEXTRACT_VERSION

      // Only writable.
      const annos = this.getAllAnnotations().filter(a => !a.readOnly && a.main !== false)

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

        if (annotation.type === 'span') {
          // Span.
          if (!dataExport['spans']) {
            dataExport['spans'] = []
          }
          dataExport['spans'].push(annotation.export(id))
          // Save temporary for relation.
          annotation.exportId = id
        } else if (annotation.type === 'rectangle') {
          // Rectangle.
          if (!dataExport['rectangles']) {
            dataExport['rectangles'] = []
          }
          dataExport['rectangles'].push(annotation.export(id))
          // Save temporary for relation.
          annotation.exportId = id
        } else if (annotation.type === 'relation') {
          // Relation.
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

      // schema Validation
      if (!this.validate(dataExport)) {
        // errorをcatchしづらい
        // reject(this.validate.errors)
        // return
        console.error(JSON.stringify(this.validate.errors))
      }

      if (exportType === 'json') {
        resolve(dataExport)
      } else {
        resolve(toTomlString(dataExport))
      }
    })
  }

  _findSpan (tomlObject, id) {
    return tomlObject.spans.find(v => {
      return id === v.id
    }) || tomlObject.rectangles.find(v => {
      return id === v.id
    })
  }

  /**
   * Import annotations.
   */
  importAnnotations (data, isPrimary) {
    window.pageStates.clear()

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

      // this.clearRenderingStates(a => a.readOnly === readOnly)

      // Add annotations.
      data.annotations.forEach((tomlString, i) => {

        // Create a object from TOML string.
        let tomlObject = fromTomlString(tomlString)
        if (!tomlObject) {
          console.timeEnd('importAnnotations')
          return
        }

        let pdfannoVersion = tomlObject.pdfanno || tomlObject.version

        if (semver.gt(pdfannoVersion, '0.4.0')) {
          // schema Validation
          if (!this.validate(tomlObject)) {
            reject(this.validate.errors)
            console.timeEnd('importAnnotations')
            return
          }
          this.importAnnotations041(tomlObject, i, readOnly, getColor)
        } else {
          this.importAnnotations040(tomlObject, i, readOnly, getColor)
        }
      })

      // Done.
      resolve(true)

      console.timeEnd('importAnnotations')
    })
  }

  /**
   * Import annotations.
   */
  importAnnotations040 (tomlObject, tomlIndex, readOnly, getColor) {
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
        span.color = getColor(tomlIndex, span.type, span.text)
        span.save()
        span.render()
        span.enableViewMode()
        // Rect.
      } else if (d.type === 'rectangle') {
        let rect = RectAnnotation.newInstanceFromTomlObject(d)
        rect.color = getColor(tomlIndex, rect.type, rect.text)
        rect.save()
        rect.render()
        rect.enableViewMode()
        // Relation.
      } else if (d.type === 'relation') {
        d.rel1 = tomlObject[d.ids[0]].uuid
        d.rel2 = tomlObject[d.ids[1]].uuid
        let relation = [RelationAnnotation.newInstanceFromTomlObject(d)]
        relation[0].color = getColor(tomlIndex, relation[0].direction, relation[0].text)

        if (relation[0].isCrossPage()) {
          relation[1] = relation[0].createSubRelation()
        }

        for (let rel of relation) {
          rel.save()
          rel.render()
          rel.enableViewMode()
        }

      } else {
        console.log('Unknown: ', key, d)
      }
    }
  }

  /**
   * Import annotations.
   */
  importAnnotations041 (tomlObject, tomlIndex, readOnly, getColor) {
    // console.log('page:', window.PDFView.pdfViewer.currentPageNumber, window.PDFView.pdfViewer._getVisiblePages())
    const visiblePages = window.PDFView.pdfViewer._getVisiblePages()

    // order is important.
    ;['spans', 'rectangles', 'relations'].forEach(key => {
      const objs = tomlObject[key]
      if (Array.isArray(objs)) {
        objs.forEach(obj => {
          obj.uuid = uuid()
          obj.readOnly = readOnly

          if (key === 'spans') {
            const span = SpanAnnotation.newInstanceFromTomlObject(obj)
            span.color = getColor(tomlIndex, 'span', span.text)
            span.save()
            if (span.visible(visiblePages)) {
              // console.log('SPAN:', span.page, span.uuid)
              span.render()
              span.enableViewMode()
            }
          } else if (key === 'rectangles') {
            const rectangle = RectAnnotation.newInstanceFromTomlObject(obj)
            rectangle.color = getColor(tomlIndex, 'rectangle', rectangle.text)
            rectangle.save()
            if (rectangle.visible(visiblePages)) {
              // console.log('RECTANGLE:', rectangle.page, rectangle.uuid)
              rectangle.render()
              rectangle.enableViewMode()
            }
          } else if (key === 'relations') {
            const spans = [
              this.findById(this._findSpan(tomlObject, obj.head).uuid),
              this.findById(this._findSpan(tomlObject, obj.tail).uuid)
            ]
            obj.rel1 = spans[0].uuid
            obj.rel2 = spans[1].uuid

            const relation = [RelationAnnotation.newInstanceFromTomlObject(obj)]
            relation[0].color = getColor(tomlIndex, relation[0].direction, relation[0].text)

            if (relation[0].isCrossPage()) {
              relation[1] = relation[0].createSubRelation()
            }

            if (relation[0].visible(visiblePages)) {
              spans.filter(span => span.isRenderingInitial()).forEach(span => {
                // console.log('RELSPAN:', span.page, span.uuid)
                span.render()
                span.enableViewMode()
              })
            }

            for (let rel of relation) {
              rel.save()
              if (rel.visible(visiblePages)) {
                // console.log('REL:', rel._rel1Annotation.uuid, rel._rel2Annotation.uuid)
                rel.render()
                rel.enableViewMode()
              }
            }
          }
        })
      }
    })
  }
}

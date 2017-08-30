import toml from 'toml'
import ANNO_VERSION from '../version'
import tomlString from '../utils/tomlString'
import { convertToExportY, convertFromExportY } from '../../../shared/coords'
import uuid from '../utils/uuid'

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
    }

    /**
     * Remove the annotation from the container.
     */
    remove (annotation) {
        this.set.delete(annotation)
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
     * Export annotations as a TOML string.
     */
    exportData () {

        return new Promise((resolve, reject) => {

            let dataExport = {}

            // Set version.
            dataExport.version = ANNO_VERSION

            // Create export data.
            this.getAllAnnotations().filter(a => {
                // Just only primary annos.
                return !a.readOnly

            }).forEach(annotation => {

                // Span.
                if (annotation.type === 'span') {

                    // TODO Define at annotation/span.js

                    // page.
                    let { pageNumber } = convertToExportY(annotation.rectangles[0].y)

                    // rectangles.
                    let rectangles = annotation.rectangles.map(rectangle => {
                        const { y } = convertToExportY(rectangle.y)
                        return [
                            rectangle.x,
                            y,
                            rectangle.width,
                            rectangle.height
                        ]
                    })

                    let text = (annotation.selectedText || '')
                                .replace(/\r\n/g, ' ')
                                .replace(/\r/g, ' ')
                                .replace(/\n/g, ' ')
                                .replace(/"/g, '')
                                .replace(/\\/g, '')

                    dataExport[annotation.uuid] = {
                        type     : annotation.type,
                        page     : pageNumber,
                        position : rectangles,
                        label    : annotation.text || '',
                        text
                    }

                // Relation.
                } else if (annotation.type === 'relation') {

                    // TODO Define at annotation/relation.js

                    dataExport[annotation.uuid] = {
                        type  : 'relation',
                        dir   : annotation.direction,
                        ids   : [ annotation.rel1Annotation.uuid, annotation.rel2Annotation.uuid ],
                        label : annotation.text || ''
                    }
                }
            })

            resolve(tomlString(dataExport))
        })
    }

    /**
     * Import annotations.
     */
    importAnnotations (data, isPrimary) {

        const readOnly = !isPrimary

        return new Promise((resolve, reject) => {

            // Delete old ones.
            this.getAllAnnotations()
                    .filter(a => a.readOnly === readOnly)
                    .forEach(a => a.destroy())

            // Add annotations.
            data.annotations.forEach((tomlString, i) => {

                // TOML to JavascriptObject.
                // TODO Define as a function.
                let tomlObject
                try {
                    if (tomlString) {
                        tomlObject = toml.parse(tomlString)
                    } else {
                        tomlObject = {}
                    }
                } catch (e) {
                    console.log('ERROR:', e)
                    console.log('TOML:\n', tomlString)
                }

                let color = data.colors[i]

                for (const key in tomlObject) {

                    let d = tomlObject[key]

                    // Skip if the content is not object, like version string.
                    if (typeof d !== 'object') {
                        continue
                    }

                    d.uuid = uuid()
                    d.readOnly = !isPrimary
                    d.color = color

                    if (d.type === 'span') {

                        let span = SpanAnnotation.newInstanceFromTomlObject(d)
                        span.save()
                        span.render()
                        span.enableViewMode()

                    // Rect.
                    } else if (d.type === 'rect') {

                        let rect = RectAnnotation.newInstanceFromTomlObject(d)
                        rect.save()
                        rect.render()
                        rect.enableViewMode()

                    // Relation.
                    } else if (d.type === 'relation') {

                        d.rel1 = tomlObject[d.ids[0]].uuid
                        d.rel2 = tomlObject[d.ids[1]].uuid
                        let relation = RelationAnnotation.newInstanceFromTomlObject(d)
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

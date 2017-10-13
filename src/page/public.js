import { convertFromExportY } from '../shared/coords'
import toml from 'toml'

/**
 * Add all annotations.
 *
 * This method expect to get argument made from a TOML file parsed by `window.readTOML`.
 */
export function addAllAnnotations (tomlObject) {

    let result = {}

    for (const key in tomlObject) {

        let data = tomlObject[key]

        if (typeof data !== 'object') {
            continue
        }

        data.id = key

        let a
        if (data.type === 'span') {
            a = new PublicSpanAnnotation(data)
        } else if (data.type === 'rect') {
            a = new PublicRectAnnotation(data)
        } else if (data.type === 'relation') {
            a = new PublicRelationAnnotation(data)
        } else {
            console.log('Unknown: ', key, data)
        }

        if (a) {
            addAnnotation(a)
            result[key] = a
        }
    }

    return result

}

/**
 * Add an annotation, and render it.
 */
export function addAnnotation (publicAnnotation) {

    let a = publicAnnotation.annotation
    window.annoPage.addAnnotation(a)
    a.render()
    a.enableViewMode()
    a.save()

    // Restore the status of AnnoTools.
    window.annoPage.disableAnnotateFunctions()
    window.annoPage.enableAnnotateFunction(window.currentAnnoToolType)
}

/**
 * Delete an annotation, and also detach it from view.
 */
export function deleteAnnotation (publicAnnotation) {

    publicAnnotation.annotation.destroy()
}

/**
 * Rect Annotation Class wrapping the core.
 */
export class PublicRectAnnotation {

    /**
     * Create a rect annotation from a TOML data.
     */
    constructor ({ page, position, label = '', id = 0 }) {

        // Check inputs.
        if (!page || typeof page !== 'number') {
            throw new Error('Set the page as number.')
        }
        if (!position || position.length !== 4) {
            throw new Error('Set the position which includes `x`, `y`, `width` and `height`.')
        }

        // position: String -> Float.
        position = position.map(p => parseFloat(p))

        let rect = window.annoPage.createRectAnnotation({
            uuid     : id && String(id), // annotationid must be string.
            x        : position[0],
            y        : convertFromExportY(page, position[1]),
            width    : position[2],
            height   : position[3],
            text     : label,
            color    : '#FF0000',
            readOnly : false
        })

        this.annotation = rect
    }
}

/**
 * Rect Annotation Class wrapping the core.
 */
export class PublicSpanAnnotation {

    constructor ({ page, position, label = '', text = '', id = 0, zIndex = 10 }) {

        console.log('PublicSpanAnnotation:', zIndex)

        // Check inputs.
        if (!page || typeof page !== 'number') {
            throw new Error('Set the page as number.')
        }
        if (!position) {
            throw new Error('Set the position.')
        }

        // position: String -> Float.
        position = position.map(p => p.map(pp => parseFloat(pp)))

        // Convert.
        position = position.map(p => {
            return {
                page   : page,
                x      : p[0],
                y      : convertFromExportY(page, p[1]),
                width  : p[2],
                height : p[3]
            }
        })

        let span = window.annoPage.createSpanAnnotation({
            // TODO 既存のものとかぶるのではないか？
            uuid         : id && String(id), // annotationid must be string.
            rectangles   : position,
            text         : label,
            color        : '#FFFF00',
            readOnly     : false,
            selectedText : text,
            zIndex
        })

        this.annotation = span
    }
}

/**
 * Rect Annotation Class wrapping the core.
 */
export class PublicRelationAnnotation {

    constructor ({ dir, ids, label = '', id = 0 }) {

        // Check inputs.
        if (!dir) {
            throw new Error('Set the dir.')
        }
        if (!ids || ids.length !== 2) {
            throw new Error('Set the ids.')
        }

        let r = window.annoPage.createRelationAnnotation({
            // TODO 既存のものとかぶるのではないか？
            uuid      : id && String(id), // annotationid must be string.
            direction : dir,
            rel1      : typeof ids[0] === 'object' ? ids[0].annotation : ids[0],
            rel2      : typeof ids[1] === 'object' ? ids[1].annotation : ids[1],
            text      : label,
            color     : '#FF0000',
            readOnly  : false
        })

        this.annotation = r
    }
}

/**
 * TOML parser.
 */
export const readTOML = toml.parse

/**
 * Delete all annotations.
 */
export function clear () {
    window.annoPage.clearAllAnnotations()
}

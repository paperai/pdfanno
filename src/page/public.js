import { convertFromExportY } from '../shared/coords';
import { enableAnnotateTool, disableAnnotateTools } from './util/anno';
import toml from 'toml';

/**
 * Add all annotations.
 *
 * This method expect to get argument made from a TOML file parsed by `window.readTOML`.
 */
export function addAllAnnotations(tomlObject) {

    for (const key in tomlObject) {

        let data = tomlObject[key];

        if (typeof data !== 'object') {
            continue;
        }

        data.id = key;

        if (data.type === 'span') {
            addAnnotation(new PublicSpanAnnotation(data));
        } else if (data.type === 'rect') {
            addAnnotation(new PublicRectAnnotation(data));
        } else if (data.type === 'relation') {
            addAnnotation(new PublicRelationAnnotation(data));
        } else {
            console.log('Unknown: ', key, data);
        }
    }

}

/**
 * Add an annotation, and render it.
 */
export function addAnnotation(publicAnnotation) {

    let a = publicAnnotation.annotation;
    window.iframeWindow.annotationContainer.add(a);
    a.render();
    a.enableViewMode();
    a.save();

    // Restore the status of AnnoTools.
    disableAnnotateTools();
    enableAnnotateTool(window.currentAnnoToolType);
}

/**
 * Delete an annotation, and also detach it from view.
 */
export function deleteAnnotation(publicAnnotation) {

    publicAnnotation.annotation.destroy();
}

/**
 * Rect Annotation Class wrapping the core.
 */
export class PublicRectAnnotation {

    /**
     * Create a rect annotation from a TOML data.
     */
    constructor({ page, position, label='', id=0 }) {

        // Check inputs.
        if (!page || typeof page !== 'number') {
            throw 'Set the page as number.';
        }
        if (!position || position.length !== 4) {
            throw 'Set the position which includes `x`, `y`, `width` and `height`.';
        }

        // position: String -> Float.
        position = position.map(p => parseFloat(p));

        let rect = iframeWindow.PDFAnnoCore.RectAnnotation.newInstance({
            uuid     : id && String(id), // annotationid must be string.
            x        : position[0],
            y        : convertFromExportY(page, position[1]),
            width    : position[2],
            height   : position[3],
            text     : label,
            color    : "#FF0000",  // TODO 固定で良い？
            readOnly : false       // TODO 固定で良い？
        });

        this.annotation = rect;
    }

}

/**
 * Rect Annotation Class wrapping the core.
 */
export class PublicSpanAnnotation {

    constructor({ page, position, label='', text='', id=0 }) {

        // Check inputs.
        if (!page || typeof page !== 'number') {
            throw 'Set the page as number.';
        }
        if (!position) {
            throw 'Set the position.';
        }

        // position: String -> Float.
        position = position.map(p => p.map(pp => parseFloat(pp)));

        // Convert.
        position = position.map(p => {
            return {
                page   : page,
                x      : p[0],
                y      : convertFromExportY(page, p[1]),
                width  : p[2],
                height : p[3]
            }
        });

        let span = window.iframeWindow.PDFAnnoCore.SpanAnnotation.newInstance({
            uuid         : id && String(id), // annotationid must be string.
            rectangles   : position,
            text         : label,
            color        : '#FFFF00',  // TODO 固定で良い？
            readOnly     : false,      // TODO 固定で良い？
            selectedText : text
        });

        this.annotation = span;
    }


}

/**
 * Rect Annotation Class wrapping the core.
 */
export class PublicRelationAnnotation {

    constructor({ dir, ids, label='', id=0 }) {

        // Check inputs.
        if (!dir) {
            throw 'Set the dir.';
        }
        if (!ids || ids.length !== 2) {
            throw 'Set the ids.';
        }

        let r = iframeWindow.PDFAnnoCore.RelationAnnotation.newInstance({
            uuid      : id && String(id), // annotationid must be string.
            direction : dir,
            rel1      : typeof ids[0] === 'object' ? ids[0].annotation : ids[0],
            rel2      : typeof ids[1] === 'object' ? ids[1].annotation : ids[1],
            text      : label,
            color     : "#FF0000",
            readOnly  : false
        });

        this.annotation = r;
    }
}

/**
 * TOML parser.
 */
export const readTOML = toml.parse;


export function deleteAll(tomlString) {
    const tomlObject = toml.parse(tomlString);
    // console.log('tomlObject:', tomlObject);

    Object.keys(tomlObject)
        .filter(key => key !== 'version')
        .forEach(key => {
            console.log('key:', key);
            window.iframeWindow.annotationContainer.findById(key).destroy();
        });
}

export function clear() {

    window.iframeWindow.annotationContainer.getAllAnnotations().forEach(a => a.destroy());
}

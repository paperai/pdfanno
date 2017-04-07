import { convertFromExportY } from '../shared/coords';
import { enableAnnotateTool, disableAnnotateTools } from './util/anno';

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

    constructor({ page, positions, label='', text='', id=0 }) {

        // Check inputs.
        if (!page || typeof page !== 'number') {
            throw 'Set the page as number.';
        }
        if (!positions) {
            throw 'Set the positions.';
        }

        // Convert.
        positions = positions.map(p => {
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
            rectangles   : positions,
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

    constructor({ dir, ids, label='' }) {

        // Check inputs.
        if (!dir) {
            throw 'Set the dir.';
        }
        if (!ids || ids.length !== 2) {
            throw 'Set the ids.';
        }

        let r = iframeWindow.PDFAnnoCore.RelationAnnotation.newInstance({
            direction : dir,
            rel1      : ids[0],
            rel2      : ids[1],
            text      : label,
            color     : "#FF0000",  // TODO 固定で良い？
            readOnly  : false       // TODO 固定で良い？
        });

        this.annotation = r;
    }


}

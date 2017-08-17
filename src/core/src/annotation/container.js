import assign from 'deep-assign';
import toml from 'toml';
import ANNO_VERSION from '../version';
import tomlString from '../utils/tomlString';
import { convertToExportY, convertFromExportY } from '../../../shared/coords';
import uuid from '../utils/uuid';

import SpanAnnotation from './span';
import RelationAnnotation from './relation';

/**
 * Annotation Container.
 */
export default class AnnotationContainer {

    /**
     * Constructor.
     */
    constructor() {
        this.set = new Set();
    }

    /**
     * Add an annotation to the container.
     */
    add(annotation) {

        // if (annotation.uuid) {
        //     let a = this.findById(annotation.uuid);
        //     if (a) {
        //         a.destroy();
        //         this.remove(a);
        //     }
        // }

        this.set.add(annotation);
    }

    /**
     * Remove the annotation from the container.
     */
    remove(annotation) {
        this.set.delete(annotation);
    }

    /**
     * Remove all annotations.
     */
    destroy() {
        this.set.forEach(a => a.destroy());
        this.set = new Set();
    }

    /**
     * Get all annotations from the container.
     */
    getAllAnnotations() {
        let list = [];
        this.set.forEach(a => list.push(a));
        return list;
    }

    getSelectedAnnotations() {
        return this.getAllAnnotations().filter(a => a.selected);
    }

    /**
     * Find an annotation by the id which an annotation has.
     */
    findById(uuid) {
        uuid = String(uuid); // `uuid` must be string.
        let annotation = null;
        this.set.forEach(a => {
            if (a.uuid === uuid) {
                annotation = a;
            }
        });
        return annotation;
    }

    enableAll() {
        this.getAllAnnotations().forEach(a => a.enable());
    }

    disableAll() {
        this.getAllAnnotations().forEach(a => a.disable());
    }

    exportData() {
        // TODO Remove Promise.
      return new Promise((resolve, reject) => {

            let dataExport = {};

            // Set version.
            dataExport.version = ANNO_VERSION;

            // Annotation index.
            // let index = 1;

            this.getAllAnnotations().filter(a => {

                return !a.readOnly;

            }).forEach(annotation => {

                // Rect
                // if (annotation.type === 'area') {
                //     let key = `${index++}`;
                //     dataExport[key] = {
                //         type     : 'rect',
                //         page     : annotation.page,
                //         position : [ annotation.x, annotation.y, annotation.width, annotation.height ],
                //         label    : annotation.text || ''
                //     };

                //     // save tmporary for relation.
                //     annotation.key = key;

                // Span.
                // } else if (annotation.type === 'span') {
                if (annotation.type === 'span') {

                    // const rectangles = annotation.rectangles.map(r => {
                    //     const {y, pageNumber} = convertToExportY(r.y);
                    //     return assign({}, r, { page, y });
                    // })

                    // // Copy for avoiding sharing.
                    // annotation.rectangles = annotation.rectangles.map(a => assign({}, a));
                    // annotation.rectangles.forEach(r => {
                    //     let {y, pageNumber} = convertToExportY(r.y);
                    //     r.y = y;
                    //     r.page = pageNumber;
                    // });

                    // page.
                    let { pageNumber } = convertToExportY(annotation.rectangles[0].y);

                    // rectangles.
                    let rectangles = annotation.rectangles.map(rectangle => {
                        const { y, pageNumber } = convertToExportY(rectangle.y);
                        return [
                            rectangle.x,
                            y,
                            rectangle.width,
                            rectangle.height
                        ];
                    });

                    let text = (annotation.selectedText || '')
                                .replace(/\r\n/g, ' ')
                                .replace(/\r/g, ' ')
                                .replace(/\n/g, ' ')
                                .replace(/"/g, '')
                                .replace(/\\/g, '');

                    // let key = `${index++}`;
                    dataExport[annotation.uuid] = {
                        type     : 'span',
                        page     : pageNumber,
                        position : rectangles,
                        label    : annotation.text || '',
                        text
                    };

                    // save tmporary for relation.
                    // annotation.key = key;

                // Relation.
                } else if (annotation.type === 'relation') {

                    // let rel1s = container.annotations.filter(a => a.uuid === annotation.rel1);
                    // let rel1 = rel1s[0];
                    // let rel2s = container.annotations.filter(a => a.uuid === annotation.rel2);
                    // let rel2 = rel2s[0];

                    dataExport[annotation.uuid] = {
                        type  : 'relation',
                        dir   : annotation.direction,
                        ids   : [ annotation.rel1Annotation.uuid, annotation.rel2Annotation.uuid ],
                        label : annotation.text || ''
                    };

                }



            })

            // // Every documents.
            // let container = _getContainer();

            // // // Annotation index.
            // // let index = 1;

            // (container.annotations || []).forEach(annotation => {

            //     // Rect
            //     if (annotation.type === 'area') {
            //         let key = `${index++}`;
            //         dataExport[key] = {
            //             type     : 'rect',
            //             page     : annotation.page,
            //             position : [ annotation.x, annotation.y, annotation.width, annotation.height ],
            //             label    : annotation.text || ''
            //         };

            //         // save tmporary for relation.
            //         annotation.key = key;

            //     // Span.
            //     } else if (annotation.type === 'span') {
            //         // rectangles.
            //         let rectangles = annotation.rectangles.map(rectangle => {
            //             return [
            //                 rectangle.x,
            //                 rectangle.y,
            //                 rectangle.width,
            //                 rectangle.height
            //             ];
            //         });

            //         let text = (annotation.selectedText || '')
            //                     .replace(/\r\n/g, ' ')
            //                     .replace(/\r/g, ' ')
            //                     .replace(/\n/g, ' ')
            //                     .replace(/"/g, '')
            //                     .replace(/\\/g, '');

            //         let key = `${index++}`;
            //         dataExport[key] = {
            //             type     : 'span',
            //             page     : annotation.rectangles[0].page,
            //             position : rectangles,
            //             label    : annotation.text || '',
            //             text
            //         };

            //         // save tmporary for relation.
            //         annotation.key = key;

            //     // Relation.
            //     } else if (annotation.type === 'relation') {

            //         let rel1s = container.annotations.filter(a => a.uuid === annotation.rel1);
            //         let rel1 = rel1s[0];
            //         let rel2s = container.annotations.filter(a => a.uuid === annotation.rel2);
            //         let rel2 = rel2s[0];

            //         dataExport[`${index++}`] = {
            //             type  : 'relation',
            //             dir   : annotation.direction,
            //             ids   : [ rel1.key, rel2.key ],
            //             label : annotation.text || ''
            //         };

            //     }

            // });


            resolve(tomlString(dataExport));
        });
    }


    importAnnotations(data, isPrimary) {
        // TODO Remove promise.
        return new Promise((resolve, reject) => {

            // Delete old ones.
            this.getAllAnnotations().forEach(a => {

                if (isPrimary) {
                    if (!a.readOnly) {
                        a.destroy();
                    }

                } else {
                    if (a.readOnly) {
                        a.destroy();
                    }
                }
            });


            // Add annotations.
            data.annotations.forEach((tomlString, i) => {

                // TOML to JavascriptObject.
                let tomlObject;
                try {
                    if (tomlString) {
                        tomlObject = toml.parse(tomlString);
                    } else {
                        tomlObject = {};
                    }
                } catch (e) {
                    console.log('ERROR:', e);
                    console.log('TOML:\n', tomlString);
                }

                let color = data.colors[i];


                for (const key in tomlObject) {

                    let d = tomlObject[key];

                    // Skip if the content is not object, like version string.
                    if (typeof d !== 'object') {
                        continue;
                    }

                    d.uuid = uuid();
                    d.readOnly = !isPrimary;
                    d.color = color;

                    let a;
                    if (d.type === 'span') {
                        // a = new PublicSpanAnnotation(d);

                        // position: String -> Float.
                        let position = d.position.map(p => p.map(pp => parseFloat(pp)));

                        d.selectedText = d.text;
                        d.text = d.label;

                        // Convert.
                        d.rectangles = position.map(p => {
                            return {
                                x      : p[0],
                                y      : convertFromExportY(d.page, p[1]),
                                width  : p[2],
                                height : p[3]
                            }
                        });

                        // let span = SpanAnnotation.newInstance(annotation) {
                        //     let a          = new SpanAnnotation();
                        //     a.uuid         = annotation.uuid || uuid();
                        //     a.rectangles   = annotation.rectangles;
                        //     a.text         = annotation.text;
                        //     a.color        = annotation.color;
                        //     a.readOnly     = annotation.readOnly || false;
                        //     a.selectedText = annotation.selectedText;
                        //     return a;
                        // }

                        let span = SpanAnnotation.newInstance(d);
                        span.save();
                        span.render();
                        span.enableViewMode();

                        // let span = window.annoPage.createSpanAnnotation({
                        //     uuid         : id && String(id), // annotationid must be string.
                        //     rectangles   : position,
                        //     text         : label,
                        //     color        : '#FFFF00',
                        //     readOnly     : false,
                        //     selectedText : text
                        // });

                        // this.annotation = span;









                    // } else if (d.type === 'rect') {
                    //     a = new PublicRectAnnotation(d);
                    } else if (d.type === 'relation') {



                        // // Check inputs.
                        // if (!dir) {
                        //     throw 'Set the dir.';
                        // }
                        // if (!ids || ids.length !== 2) {
                        //     throw 'Set the ids.';
                        // }

                        // let r = window.annoPage.createRelationAnnotation({
                        //     uuid      : id && String(id), // annotationid must be string.
                        //     direction : dir,
                        //     rel1      : typeof ids[0] === 'object' ? ids[0].annotation : ids[0],
                        //     rel2      : typeof ids[1] === 'object' ? ids[1].annotation : ids[1],
                        //     text      : label,
                        //     color     : "#FF0000",
                        //     readOnly  : false
                        // });

                        // this.annotation = r;

                        d.direction = d.dir;
                        d.rel1 = tomlObject[d.ids[0]].uuid;
                        d.rel2 = tomlObject[d.ids[1]].uuid;
                        // TODO Annotation側を、labelに合わせてもいいかも。
                        d.text = d.label;

                        let relation = RelationAnnotation.newInstance(d);
                        relation.save();
                        relation.render();
                        relation.enableViewMode();

                        /*
                        static newInstance(annotation) {
                            let a            = new RelationAnnotation();
                            a.uuid           = annotation.uuid || uuid();
                            a.direction      = annotation.direction;
                            a.rel1Annotation = AbstractAnnotation.isAnnotation(annotation.rel1) ? annotation.rel1 : window.annotationContainer.findById(annotation.rel1);
                            a.rel2Annotation = AbstractAnnotation.isAnnotation(annotation.rel2) ? annotation.rel2 : window.annotationContainer.findById(annotation.rel2);
                            a.text           = annotation.text;
                            a.color          = annotation.color;
                            a.readOnly       = annotation.readOnly || false;
                            return a;
                        }
                        */













                        // a = new PublicRelationAnnotation(d);
                    } else {
                        console.log('Unknown: ', key, d);
                    }

                    // if (a) {
                    //     addAnnotation(a);
                    //     result[key] = a;
                    // }
                }


            });


            // let currentContainers = _getContainers().filter(c => {

            //     // Remove the primary annotations when importing a new primary ones.
            //     if (isPrimary) {
            //         return !c.isPrimary;

            //     // Otherwise, remove reference annotations.
            //     } else {
            //         return c.isPrimary;
            //     }
            // });


            // let containers = data.annotations.map((a, i) => {

            //     // TOML to JavascriptObject.
            //     try {
            //         if (a) {
            //             a = toml.parse(a);
            //         } else {
            //             a = {};
            //         }
            //     } catch (e) {
            //         console.log('ERROR:', e);
            //         console.log('TOML:\n', a);
            //     }

            //     let color = data.colors[i];

            //     return _createContainerFromJson(a, color, isPrimary);

            // }).filter(c => c);

            // containers = currentContainers.concat(containers);
            // _saveContainers(containers);
            resolve(true);
        });
    }



}


/**
 * Transform the coords from localData to rendering system.
 */
function _transformToRenderCoordinate(annotation) {

    let _type = 'render';

    if (annotation.coords === _type) {
        return annotation;
    }

    annotation.coords = _type;


    // Copy for avoiding sharing.
    annotation = assign({}, annotation);

    if (annotation.y) {
        annotation.y = convertFromExportY(annotation.page, annotation.y);
    }

    // TODO Remove?
    if (annotation.y1) {
        annotation.y1 = convertFromExportY(annotation.page1, annotation.y1);
    }

    // TODO Remove?
    if (annotation.y2) {
        annotation.y2 = convertFromExportY(annotation.page2, annotation.y2);
    }

    if (annotation.rectangles) {
        // Copy for avoiding sharing.
        annotation.rectangles = annotation.rectangles.map(a => assign({}, a));
        annotation.rectangles.forEach(r => {
            r.y = convertFromExportY(r.page, r.y);
        });
    }

    return annotation;
}

/**
 * Transform coordinate system from renderSystem to localSystem.
 */
function _transformFromRenderCoordinate(annotation) {

    let _type = 'saveData';

    if (annotation.coords === _type) {
        console.log('skip: ', annotation);
        return annotation;
    }

    // Copy for avoiding sharing.
    annotation = assign({}, annotation);

    annotation.coords = _type;

    if (annotation.y) {
        let {y, pageNumber} = convertToExportY(annotation.y);
        annotation.y = y;
        annotation.page = pageNumber;
    }

    if (annotation.y1) {
        let {y, pageNumber} = convertToExportY(annotation.y1);
        annotation.y1 = y;
        annotation.page1 = pageNumber;
    }

    if (annotation.y2) {
        let {y, pageNumber} = convertToExportY(annotation.y2);
        annotation.y2 = y;
        annotation.page2 = pageNumber;
    }

    if (annotation.rectangles) {
        // Copy for avoiding sharing.
        annotation.rectangles = annotation.rectangles.map(a => assign({}, a));
        annotation.rectangles.forEach(r => {
            let {y, pageNumber} = convertToExportY(r.y);
            r.y = y;
            r.page = pageNumber;
        });
    }

    return annotation;
}






import assign from 'deep-assign';
import toml from 'toml';
import uuid from '../utils/uuid';
import tomlString from '../utils/tomlString';
import StoreAdapter from './StoreAdapter';
import ANNO_VERSION from '../version';
import { convertToExportY } from '../utils/position';

/**
 * The LocalStorage key for save annotations.
 */
const LOCALSTORAGE_KEY = '_pdfanno_containers';

/**
    Implmenetation of StoreAdapter for PDFAnno.
*/
export default class PdfannoStoreAdapter extends StoreAdapter {
    constructor() {
        super({
            getAnnotations(documentId) {
                return new Promise((resolve, reject) => {
                    let annotations = getAnnotations(documentId);
                    resolve({
                        documentId,
                        pageNumber,
                        annotations
                    });
                });
            },

            getSecondaryAnnotations(documentId) {
                return new Promise((resolve, reject) => {

                    let annotations = [];
                    let containers = _getSecondaryContainers();
                    containers.forEach(container => {
                        // let tmpAnnotations = (container[documentId] || {}).annotations || [];
                        let tmpAnnotations = container.annotations || [];
                        annotations = annotations.concat(tmpAnnotations);
                    });

                    // Convert coordinate system.
                    annotations = annotations.map(a => transformToRenderCoordinate(a));

                    console.log('getSecondaryAnnotations:', annotations);

                    resolve({
                        documentId,
                        pageNumber,
                        annotations
                    });
                });
            },

            getAnnotation(documentId, annotationId) {
                return Promise.resolve(getAnnotations(documentId)[findAnnotation(documentId, annotationId)]);
            },

            addAnnotation(documentId, annotation) {
                return new Promise((resolve, reject) => {
                    annotation.class = 'Annotation';
                    annotation.uuid = annotation.uuid || uuid();
                    let annotations = getAnnotations(documentId);
                    annotations.push(annotation);
                    updateAnnotations(documentId, annotations);
                    resolve(annotation);
                });
            },

            editAnnotation(documentId, annotationId, annotation) {
                return new Promise((resolve, reject) => {
                    let annotations = getAnnotations(documentId);
                    annotations[findAnnotation(documentId, annotationId)] = annotation;
                    updateAnnotations(documentId, annotations);

                    resolve(annotation);
                });
            },

            deleteAnnotation(documentId, annotationId) {
                return new Promise((resolve, reject) => {
                    let index = findAnnotation(documentId, annotationId);
                    if (index > -1) {
                        let annotations = getAnnotations(documentId);
                        annotations.splice(index, 1);
                        updateAnnotations(documentId, annotations);
                    }
                    resolve(true);
                });
            },

            deleteAnnotations(documentId) {
                return new Promise((resolve, reject) => {
                    let container = _getContainer();
                    delete container[documentId];
                    _saveContainer(container);
                    resolve();
                });
            },

            exportData() {
              return new Promise((resolve, reject) => {

                    let dataExport = {};

                    // Set version.
                    dataExport.version = ANNO_VERSION;

                    // Every documents.
                    let container = _getContainer();

                    // Annotation index.
                    let index = 1;

                    (container.annotations || []).forEach(annotation => {

                        // Rect
                        if (annotation.type === 'area') {
                            let key = `${index++}`;
                            dataExport[key] = {
                                type     : 'rect',
                                page     : annotation.page,
                                position : [ annotation.x, annotation.y, annotation.width, annotation.height ],
                                label    : annotation.text || ''
                            };

                            // save tmporary for relation.
                            annotation.key = key;

                        // Span.
                        } else if (annotation.type === 'span') {
                            // rectangles.
                            let rectangles = annotation.rectangles.map(rectangle => {
                                return [
                                    rectangle.x,
                                    rectangle.y,
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

                            let key = `${index++}`;
                            dataExport[key] = {
                                type     : 'span',
                                page     : annotation.rectangles[0].page,
                                position : rectangles,
                                label    : annotation.text || '',
                                text
                            };

                            // save tmporary for relation.
                            annotation.key = key;

                        // Relation.
                        } else if (annotation.type === 'relation') {

                            let rel1s = container.annotations.filter(a => a.uuid === annotation.rel1);
                            let rel1 = rel1s[0];
                            let rel2s = container.annotations.filter(a => a.uuid === annotation.rel2);
                            let rel2 = rel2s[0];

                            dataExport[`${index++}`] = {
                                type  : 'relation',
                                dir   : annotation.direction,
                                ids   : [ rel1.key, rel2.key ],
                                label : annotation.text || ''
                            };

                        }

                    });


                    resolve(tomlString(dataExport));
                    // resolve(dataExport);
                });
            },

            importAnnotations(data, isPrimary) {
                return new Promise((resolve, reject) => {


                    let currentContainers = _getContainers().filter(c => {

                        // Remove the primary annotations when importing a new primary ones.
                        if (isPrimary) {
                            return !c.isPrimary;

                        // Otherwise, remove reference annotations.
                        } else {
                            return c.isPrimary;
                        }
                    });


                    let containers = data.annotations.map((a, i) => {

                        // TOML to JavascriptObject.
                        try {
                            if (a) {
                                a = toml.parse(a);
                            } else {
                                a = {};
                            }
                        } catch (e) {
                            console.log('ERROR:', e);
                            console.log('TOML:\n', a);
                        }

                        let color = data.colors[i];

                        return _createContainerFromJson(a, color, isPrimary);

                    }).filter(c => c);

                    containers = currentContainers.concat(containers);
                    _saveContainers(containers);
                    resolve(true);
                });
            },

            findAnnotations(documentId, criteria={}) {
                return new Promise((resolve, reject) => {
                    let annotations = getAnnotations(documentId).filter(annotation => {
                        let flg = true;
                        for (let key in criteria) {
                            let value = criteria[key];
                            if (annotation[key] !== value) {
                                flg = false;
                            }
                        }
                        return flg;
                    });
                    resolve(annotations);
                });
            }

        });
    }
}

/**
 * Create annotation from an exported json file.
 */
function _createContainerFromJson(json, color, isPrimary) {

    if (!json) {
        return null;
    }

    let readOnly = !isPrimary;

    let container = {};

    container.isPrimary = isPrimary;


        let annotations = [];
        container.annotations = annotations;

        for (let key in json) {

            if (key === 'version') {
                    continue;
            }

            let data = json[key];

            // Rect.
            if (data.type === 'rect') {
                annotations.push({
                    class  : 'Annotation',
                    type   : 'area',
                    uuid   : uuid(),
                    page   : data.page,
                    x      : data.position[0],
                    y      : data.position[1],
                    width  : data.position[2],
                    height : data.position[3],
                    text   : data.label,
                    readOnly,
                    color,
                    key    : key // tmp for relation.
                });

            // Span.
            } else if (data.type === 'span') {
                    // rectangles.
                    let rectangles = data.position.map(d => {
                        return {
                            page   : data.page,
                            x      : d[0],
                            y      : d[1],
                            width  : d[2],
                            height : d[3]
                        }
                    });
                    annotations.push({
                        class        : 'Annotation',
                        type         : 'span',
                        uuid         : uuid(),
                        page         : data.page,
                        rectangles,
                        text         : data.label,
                        selectedText : data.text,
                        key          : key,    // tmp for relation.
                        readOnly,
                        color
                    });

            // Relation.
            } else if (data.type === 'relation') {

                // Find rels.
                let rel1 = annotations.filter(a => a.key === data.ids[0])[0];
                let rel2 = annotations.filter(a => a.key === data.ids[1])[0];

                // Add relation.
                annotations.push({
                    class     : 'Annotation',
                    type      : 'relation',
                    direction : data.dir,
                    uuid      : uuid(),
                    text      : data.label,
                    rel1      : rel1.uuid,
                    rel2      : rel2.uuid,
                    readOnly,
                    color
                });
            }
    }

    return container;
}

/**
 * Get a page size of a single PDF page.
 */
function getPageSize() {
    let viewBox = PDFView.pdfViewer.getPageView(0).viewport.viewBox;
    let size = { width : viewBox[2], height : viewBox[3] };
    return size;
}

/**
 * Transform the coords from localData to rendering system.
 */
function transformToRenderCoordinate(annotation) {

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
function transformFromRenderCoordinate(annotation) {

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

/**
 * Get all containers(primary/secondary) from localStorage.
 */
function _getContainers() {
    let containers = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]');
    return containers;
}

/**
 * Get a primary container.
 */
function _getContainer() {

    let containers = _getContainers().filter(c => {
        return c.isPrimary;
    });

    if (containers.length > 0) {
        return containers[0];
    } else {
        return {};
    }
}

/**
 * Get secondary containers.
 */
function _getSecondaryContainers() {
    let containers = _getContainers().filter(c => !c.isPrimary);
    if (containers.length > 0) {
        return containers;
    } else {
        return [];
    }
}

/**
 * Save a container to localStorage.
 */
function _saveContainer(container) {

    container.isPrimary = true;

    let containers = _getContainers().filter(c => {
        return c.isPrimary === false;
    });

    containers = containers.concat([container]);

    _saveContainers(containers);

}

/**
 * Save all containers to localStorage.
 */
function _saveContainers(containers) {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(containers));
}

/**
 * Get primary annotations specified by documentId.
 */
function getAnnotations(documentId) {
    // Primary annotation.
    let container = _getContainer();
    // let annotations = (container[documentId] || {}).annotations || [];
    let annotations = container.annotations || [];

    // transform coordinate system.
    annotations = annotations.map(a => transformToRenderCoordinate(a));

    return annotations;
}

/**
 * Save annotations(in arguments) to the annotation container.
 */
function updateAnnotations(documentId, annotations) {

    // Transform coordinate system.
    annotations = annotations.map(a => transformFromRenderCoordinate(a));

    let viewBox = PDFView.pdfViewer.getPageView(0).viewport.viewBox;

    let container = _getContainer();
    // container[documentId] = { annotations };
    container.annotations = annotations;
    _saveContainer(container);

    // Notifiy.
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('annotationUpdated', true, true, {});
    window.dispatchEvent(event);
}

/**
 * Find annotation index in the annotation container.
 */
function findAnnotation(documentId, annotationId) {
    let index = -1;
    let annotations = getAnnotations(documentId);
    for (let i=0, l=annotations.length; i<l; i++) {
        if (annotations[i].uuid === annotationId) {
            index = i;
            break;
        }
    }
    return index;
}

/**
 * The padding of page top.
 */
const paddingTop = 9;

/**
 * The padding between pages.
 */
const paddingBetweenPages = 9;

/**
 * Convert the `y` position from exported json to local coords.
 */
function convertFromExportY(pageNumber, yInPage) {

    let meta = getPageSize();

    let y = yInPage + paddingTop;

    let pagePadding = paddingBetweenPages;

    y += (pageNumber - 1) * (meta.height + pagePadding);

    return y;
}

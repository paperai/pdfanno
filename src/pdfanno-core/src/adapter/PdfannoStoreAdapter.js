import assign from 'deep-assign';
import uuid from '../utils/uuid';
import StoreAdapter from './StoreAdapter';
import ANNO_VERSION from '../version';

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
            let tmpAnnotations = (container[documentId] || {}).annotations || [];
            annotations = annotations.concat(tmpAnnotations);
          });

          // Convert coordinate system.
          annotations = annotations.map(a => transformToRenderCoordinate(a));

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
          for (let documentId in container) {

            if (!container[documentId].annotations || container[documentId].annotations.length === 0) {
              continue;
            }

            // Every annotations.
            let indexRect = 1;
            let indexSpan = 1;
            let indexRel  = 1;
            let indexText = 1;
            let annotations = {};
            dataExport[documentId] = annotations;

            container[documentId].annotations.forEach(annotation => {

              // Rect
              if (annotation.type === 'area') {
                let key = `rect-${indexRect++}`;
                annotations[key] = [
                  annotation.page,
                  annotation.x,
                  annotation.y,
                  annotation.width,
                  annotation.height,
                  annotation.text || ''
                ];
                // save tmporary for arrow.
                annotation.key = key;
                annotation.page = annotation.page;

              // Highlight.
              } else if (annotation.type === 'highlight') {
                // rectangles.
                let data = annotation.rectangles.map(rectangle => {
                  return [
                    rectangle.page,
                    rectangle.x,
                    rectangle.y,
                    rectangle.width,
                    rectangle.height
                  ];
                });
                // span text.
                let text = annotation.text || '';
                data.push(text);

                let key = `span-${indexSpan++}`;
                annotations[key] = data;

                // save tmporary for arrow.
                annotation.key = key;
                annotation.page = pageNumber;

              // Arrow.
              } else if (annotation.type === 'arrow') {

                let rel1s = container[documentId].annotations.filter(a => a.uuid === annotation.rel1);
                let rel1 = rel1s[0];
                let rel2s = container[documentId].annotations.filter(a => a.uuid === annotation.rel2);
                let rel2 = rel2s[0];

                let page;
                if (rel1.type === 'highlight') {
                  page = rel1.rectangles[0].page;
                } else {
                  page = rel1.page;
                }

                let data = [
                  page,
                  annotation.direction,
                  rel1.key,
                  rel2.key,
                  annotation.text || ''
                ];

                annotations[`rel-${indexRel++}`] = data;
              }

            });
          }

          resolve(dataExport);
        });
      },

      importAnnotations(data) {
        return new Promise((resolve, reject) => {

          let containers = data.annotations.map((a, i) => {

            let color = data.colors[i];
            let isPrimary = (i === data.primary);
            let visible = data.visibilities[i];

            if (visible) {
              return _createContainerFromJson(a, color, isPrimary);
            }

          }).filter(c => c);

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

  for (let documentId in json) {

    let annotations = [];
    container[documentId] = { annotations };

    for (let key in json[documentId]) {

      let data = json[documentId][key];

      // Rect.
      if (key.indexOf('rect') === 0) {
        annotations.push({
          class  : 'Annotation',
          type   : 'area',
          uuid   : uuid(),
          page   : data[0],
          x      : data[1],
          y      : data[2],
          width  : data[3],
          height : data[4],
          text   : data[5],
          readOnly,
          color,
          key    : key // tmp for arrow.
        });

      // Highlight.
      } else if (key.indexOf('span') === 0) {
        // rectangles.
        let rectangles = data.slice(0, data.length-1).map(d => {
          return {
            page   : d[0],
            x      : d[1],
            y      : d[2],
            width  : d[3],
            height : d[4]
          }
        });
        annotations.push({
          class      : 'Annotation',
          type       : 'highlight',
          uuid       : uuid(),
          page       : data[0][0],
          color      : '#FFFF00',   // TODO なくてもOK？
          rectangles,
          text       : data[data.length-1],
          key        : key,  // tmp for arrow.
          readOnly,
          color
        });

      // Arrow.
      } else if (key.indexOf('rel') === 0) {

        // Find rels.
        let rel1s = annotations.filter(a => a.key === data[2]);
        let rel1 = rel1s[0];
        let rel2s = annotations.filter(a => a.key === data[3]);
        let rel2 = rel2s[0];

        // Add arrow.
        annotations.push({
          class      : 'Annotation',
          type       : 'arrow',
          direction  : data[1],
          uuid       : uuid(),
          text : data[4],
          rel1       : rel1.uuid,
          rel2       : rel2.uuid,
          readOnly,
          color
        });
      }
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
  let annotations = (container[documentId] || {}).annotations || [];

  // transform coordinate system.
  annotations = annotations.map(a => transformToRenderCoordinate(a));

  return annotations;
}

/**
 * Get secondary annotations from annotation container.
 */
function _getSecondaryAnnotations(documentId) {

  let annotations = [];

  let containers = _getSecondaryContainers();

  containers.forEach(container => {
    let tmpAnnotations = (container[documentId] || {}).annotations;
    if (tmpAnnotations) {
      annotations = annotations.concat(tmpAnnotations);
    }
  });

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
  container[documentId] = { annotations };
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
 * Convert the `y` position from the local coords to exported json.
 */
function convertToExportY(y) {

  let meta = getPageSize();

  y -= paddingTop;

  let pageHeight = meta.height + paddingBetweenPages;

  let pageNumber = Math.floor(y / pageHeight) + 1;
  let yInPage = y - (pageNumber-1) * pageHeight;

  return { pageNumber, y : yInPage };
}

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

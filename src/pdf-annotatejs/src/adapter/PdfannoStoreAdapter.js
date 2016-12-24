import assign from 'deep-assign';
import uuid from '../utils/uuid';
import StoreAdapter from './StoreAdapter';
import {
  scaleDown,
  scaleUp
} from '../UI/utils';
import { getRelationTextPosition } from '../utils/relation.js';

import ANNO_VERSION from '../version';

const LOCALSTORAGE_KEY = '_pdfanno_pdfanno';
const LOCALSTORAGE_KEY_SECONDARY = '_pdfanno_pdfanno_secondary';

/**
  Implmenetation of StoreAdapter for PDFAnno.
*/
export default class PdfannoStoreAdapter extends StoreAdapter {
  constructor() {
    super({
      getAnnotations(documentId, pageNumber) {
        return new Promise((resolve, reject) => {
          let annotations = getAnnotations(documentId).filter((i) => {
            // if (pageNumber) {
            //   return i.page === pageNumber && i.class === 'Annotation';
            // } else {
              return true;
            // }            
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

      getSecondaryAnnotations(documentId, pageNumber) {
        return new Promise((resolve, reject) => {

          let annotations = [];
          let containers = _getSecondaryContainers();
          containers.forEach(container => {
            // TODO refactoring. same thing exists.
            let tmpAnnotations = ((container[documentId] || {}).annotations || []).filter(i => {
              if (pageNumber) {
                return i.page === pageNumber && i.class === 'Annotation';
              } else {
                return true;
              }
            });
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

      addAnnotation(documentId, pageNumber, annotation) {
        return new Promise((resolve, reject) => {
          annotation.class = 'Annotation';
          annotation.uuid = annotation.uuid || uuid();
          // annotation.page = pageNumber;

          let annotations = getAnnotations(documentId);
          annotations.push(annotation);


          updateAnnotations(documentId, annotations);

          resolve(annotation);
        });
      },

      addAllAnnotations(documentId, annotations) {
        return new Promise((resolve, reject) => {
          updateAnnotations(documentId, annotations);
          resolve();
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

      getComments(documentId, annotationId) {
        return new Promise((resolve, reject) => {
          resolve(getAnnotations(documentId).filter((i) => {
            return i.class === 'Comment' && i.annotation === annotationId;
          }));
        });
      },

      addComment(documentId, annotationId, content) {
        return new Promise((resolve, reject) => {
          let comment = {
            class: 'Comment',
            uuid: uuid(),
            annotation: annotationId,
            content: content
          };

          let annotations = getAnnotations(documentId);
          annotations.push(comment);
          updateAnnotations(documentId, annotations);

          resolve(comment);
        });
      },

      deleteComment(documentId, commentId) {
        return new Promise((resolve, reject) => {
          getAnnotations(documentId);
          let index = -1;
          let annotations = getAnnotations(documentId);
          for (let i=0, l=annotations.length; i<l; i++) {
            if (annotations[i].uuid === commentId) {
              index = i;
              break;
            }
          }

          if (index > -1) {
            annotations.splice(index, 1);
            updateAnnotations(documentId, annotations);
          }

          resolve(true);
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
                annotations[`rect-${indexRect++}`] = [
                  annotation.page,
                  annotation.x,
                  annotation.y,
                  annotation.width,
                  annotation.height
                ];

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
                let text = '';
                if (annotation.text) {
                  // TODO use `getAnnotations` instead.
                  let texts = container[documentId].annotations.filter(a => {
                    return a.uuid === annotation.text;
                  });
                  if (texts.length > 0) {
                    text = texts[0].content;
                  }
                }
                data.push(text);

                let key = `span-${indexSpan++}`;
                annotations[key] = data;

                // save tmporary for arrow.
                annotation.key = key;
                annotation.page = pageNumber;
              
              // Arrow.
              } else if (annotation.type === 'arrow') {
                let data = [
                  annotation.page1,
                  annotation.direction,
                ];
                let highlight1s = container[documentId].annotations.filter(a => {
                  return a.uuid === annotation.highlight1;
                });
                data.push(highlight1s[0].key);
                let highlight2s = container[documentId].annotations.filter(a => {
                  return a.uuid === annotation.highlight2;
                });
                data.push(highlight2s[0].key);
                let texts = container[documentId].annotations.filter(a => {
                  return a.uuid === annotation.text;
                });
                if (texts.length > 0) {
                  data.push(texts[0].content);
                } else {
                  data.push('');
                }
                annotations[`rel-${indexRel++}`] = data;

              // Textbox independent.
              } else if (annotation.type === 'textbox') {

                let rels = container[documentId].annotations.filter(a => {
                  // relation for arrow or highlight.
                  return a.text === annotation.uuid;
                });
                if (rels.length === 0) {
                  annotations[`text-${indexText++}`] = [
                    annotation.page,
                    annotation.x,
                    annotation.y,
                    annotation.content
                  ];
                }
              }

            });
          }

          resolve(dataExport);
        });
      },

      importData(json) {
        return new Promise((resolve, reject) => {

          // Delete version.
          delete json.version;

          let container = _createContainerFromJson(json);

          _saveContainer(container);

          resolve();
        });
      },

      importDataSecondary(jsonArray) {
        return new Promise((resolve, reject) => {

          let containers = jsonArray.map((json, index) => {
            return _createContainerFromJson(json, true, index);
          });

          _saveSecondaryContainer(containers);

          resolve();
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

function _createContainerFromJson(json, readOnly=false, index=0) {
  let container = {};

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
          readOnly,
          seq    : index
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
        // span text.
        let spanText = data[data.length-1];
        let textId = null;
        if (spanText) {
          textId = uuid();
          let svg = document.querySelector('.annotationLayer');

          let x = rectangles[0].x;
          let y = rectangles[0].y - 20; // 20 = circle'radius(3px) + input height(14px) + α

          let pageNumber = data[0][0];

          annotations.push({
            class      : 'Annotation',
            type       : 'textbox',
            uuid       : textId,
            page       : pageNumber,
            x          : x,
            y,
            content    : spanText,
            readOnly,
            seq        : index
          });
        }
        annotations.push({
          class      : 'Annotation',
          type       : 'highlight',
          uuid       : uuid(),
          page       : data[0][0],
          color      : '#FFFF00',   // TODO なくてもOK？
          rectangles,
          text       : textId,
          key        : key,  // tmp for arrow.
          readOnly,
          seq        : index
        });

      // Text Independent.
      } else if (key.indexOf('text') === 0) {
        let pageNumber = data[0];
        let yInJson = data[2];
        let y = convertFromExportY(pageNumber, yInJson, meta);

        annotations.push({
          class      : 'Annotation',
          type       : 'textbox',
          uuid       : uuid(),
          page       : data[0],
          x          : data[1],
          y          : data[2],
          content    : data[3],
          readOnly,
          seq        : index
        });

      // Arrow.
      } else if (key.indexOf('rel') === 0) {

        // Find highlights.
        let highlight1s = annotations.filter(a => {
          return a.key === data[2];
        });
        let highlight1 = highlight1s[0];
        let highlight2s = annotations.filter(a => {
          return a.key === data[3];
        });
        let highlight2 = highlight2s[0];

        // Specify startPosition and endPosition.
        let x1 = highlight1.rectangles[0].x;
        let y1 = highlight1.rectangles[0].y - 5;
        let x2 = highlight2.rectangles[0].x;
        let y2 = highlight2.rectangles[0].y - 5;

        let page1 = highlight1.rectangles[0].page;
        let page2 = highlight2.rectangles[0].page;

        console.log('xy:', x1, y1, x2, y2, page1, page2);

        // Specify textbox position.
        // let svg = document.querySelector('.annotationLayer');
        let svg = document.getElementById('annoLayer'); // TODO make it const.
        let p = scaleUp(svg, { x1, y1, x2, y2 });
        let rect = svg.getBoundingClientRect();
        p.x1 -= rect.left;
        p.y1 -= rect.top;
        p.x2 -= rect.left;
        p.y2 -= rect.top;
        let textPosition = scaleDown(svg, getRelationTextPosition(svg, p.x1, p.y1, p.x2, p.y2));

        // Add textbox and get the uuid of if.
        let textId = null;
        let textContent = data[4];
        if (textContent) {

          textId = uuid();
          annotations.push({
            class      : 'Annotation',
            type       : 'textbox',
            uuid       : textId,
            page       : data[0],
            x          : textPosition.x,
            y          : textPosition.y,
            content    : textContent,
            readOnly,
            seq        : index
          });          
        }

        let pageNumber = data[0];

        // Add arrow.
        annotations.push({
          class      : 'Annotation',
          type       : 'arrow',
          direction  : data[1],
          uuid       : uuid(),
          page       : data[0],
          x1,
          y1,
          x2,
          y2,
          page1,
          page2,
          text       : textId,
          highlight1 : highlight1.uuid,
          highlight2 : highlight2.uuid,
          color      : "FF0000",         // TODO 要る？
          readOnly,
          seq        : index
        });
      }
    }
  }

  return container;
}

function getPageSize() {
  let viewBox = PDFView.pdfViewer.getPageView(0).viewport.viewBox;
  let size = { width : viewBox[2], height : viewBox[3] };
  return size;
}

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

  if (annotation.y1) {
    annotation.y1 = convertFromExportY(annotation.page1, annotation.y1);
  }

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

function transformFromRenderCoordinate(annotation) {

  let _type = 'saveData';

  if (annotation.coords === _type) {
    return annotation;
  }

  annotation.coords = _type;

  // Copy for avoiding sharing.
  annotation = assign({}, annotation);

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
    // annotation.rectangles = [...annotation.rectangles];
    annotation.rectangles = annotation.rectangles.map(a => assign({}, a));
    annotation.rectangles.forEach(r => {
      let {y, pageNumber} = convertToExportY(r.y);
      r.y = y;
      r.page = pageNumber;

      console.log('rec:', r.y, y, pageNumber);
    });
  }

  return annotation;
}


function _getContainer() {
  let container = localStorage.getItem(LOCALSTORAGE_KEY);
  if (!container) {
    container = {};
    _saveContainer(container);
  } else {
    container = JSON.parse(container);
  }
  return container;
}

function _getSecondaryContainers() {
  let containers = localStorage.getItem(LOCALSTORAGE_KEY_SECONDARY) || '[]';
  return JSON.parse(containers);
}

function _saveContainer(container) {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(container));
}

function _saveSecondaryContainer(containers) {
  localStorage.setItem(LOCALSTORAGE_KEY_SECONDARY, JSON.stringify(containers));
}

function getAnnotations(documentId) {
  // Primary annotation.
  let container = _getContainer();
  let annotations = (container[documentId] || {}).annotations;
  return annotations || [];
}

function _getSecondaryAnnotations(documentId) {

  let annotations = [];

  let containers = _getSecondaryContainers();
  containers.forEach(container => {
    let tmpAnnotations = (container[documentId] || {}).annotations;
    if (tmpAnnotations) {
      annotations = annotations.concat(tmpAnnotations);
    }
  });

  return annotations;
}


function updateAnnotations(documentId, annotations) {

  // Transform coordinate system.
  annotations = annotations.map(a => transformFromRenderCoordinate(a));

  let viewBox = PDFView.pdfViewer.getPageView(0).viewport.viewBox;
  let meta = { w : viewBox[2], h : viewBox[3] };

  let container = _getContainer();
  container[documentId] = { meta, annotations };
  _saveContainer(container);
}

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

const paddingTop = 0;
const paddingBetweenPages = 9;

function convertToExportY(y, meta) {

  meta = getPageSize();

  y -= paddingTop;

  let pageNumber = Math.floor(y / meta.height) + 1;
  let yInPage = y - (pageNumber-1) * (meta.height + paddingBetweenPages);

  return { pageNumber, y : yInPage };
}

function convertFromExportY(pageNumber, yInPage, meta) {

  meta = getPageSize();

  let y = yInPage + paddingTop;

  y += (pageNumber - 1) * (meta.height + paddingBetweenPages);

  return y;
}

const paddingLeft = 0;

function convertToExportX(x, meta) {
  return x - paddingLeft;
}
function convertFromExportX(x, meta) {
  return x + paddingLeft;
}
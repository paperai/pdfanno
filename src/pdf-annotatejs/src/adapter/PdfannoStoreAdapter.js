import assign from 'deep-assign';
import uuid from '../utils/uuid';
import StoreAdapter from './StoreAdapter';
import {
  scaleDown,
  scaleUp
} from '../UI/utils';
import { getRelationTextPosition } from '../utils/relation.js';

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
      getAnnotations(documentId, pageNumber) {
        return new Promise((resolve, reject) => {
          let annotations = getAnnotations(documentId).filter((i) => {
            // if (pageNumber) {
            //   return i.page === pageNumber && i.class === 'Annotation';
            // } else {
              return true;
            // }            
          });

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
              // if (pageNumber) {
              //   return i.page === pageNumber && i.class === 'Annotation';
              // } else {
                return true;
              // }
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

            // console.log('annos:', container, documentId, container[documentId].annotations);

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

                console.log(page);

                let data = [
                  page,
                  annotation.direction,
                  rel1.key,
                  rel2.key,
                  annotation.text || ''
                ];
                // data.push(rel1.key);
                // // let rel2s = container[documentId].annotations.filter(a => {
                // //   return a.uuid === annotation.rel2;
                // // });
                // data.push(rel2s[0].key);
                // let texts = container[documentId].annotations.filter(a => {
                //   return a.uuid === annotation.text;
                // });
                // if (texts.length > 0) {
                //   data.push(texts[0].content);
                // } else {
                //   data.push('');
                // }
                // data.push(annotation.text || '');
                annotations[`rel-${indexRel++}`] = data;

              }

            });
          }

          resolve(dataExport);
        });
      },

      importAnnotations(data) {
        return new Promise((resolve, reject) => {
          console.log('importAnnotations:', data);

          let containers = data.annotations.map((a, i) => {
            
            let color = data.colors[i];
            let isPrimary = (i === data.primary);
            let visible = data.visibilities[i];

            if (visible) {
              return _createContainerFromJson(a, color, isPrimary);              
            }

          }).filter(c => {
            return c;
          });

          console.log('containers:', containers);

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


        // Find highlights.
        // let rel1s = annotations.filter(a => {
        //   return a.key === data[2];
        // });
        // let rel1 = rel1s[0];
        // let rel2s = annotations.filter(a => {
        //   return a.key === data[3];
        // });
        // let rel2 = rel2s[0];

        // Specify startPosition and endPosition.
        // let x1, y1, x2, y2, page1, page2;
        // if (rel1.type === 'highlight') {
        //   x1 = rel1.rectangles[0].x;
        //   y1 = rel1.rectangles[0].y - 5;
        //   page1 = rel1.rectangles[0].page;
        // } else {
        //   x1 = rel1.x;
        //   y1 = rel1.y - 5;          
        //   page1 = rel1.page;
        // }
        // if (rel2.type === 'highlight') {
        //   x2 = rel2.rectangles[0].x;
        //   y2 = rel2.rectangles[0].y - 5;   
        //   page2 = rel2.rectangles[0].page;       
        // } else {
        //   x2 = rel2.x;
        //   y2 = rel2.y - 5;
        //   page2 = rel2.page;
        // }

        // let textPage = page1;

        // Specify textbox position.
        // let svg = document.querySelector('.annotationLayer');
        // let svg = document.getElementById('annoLayer'); // TODO make it const.
        // let p = scaleUp(svg, { x1, y1, x2, y2 });
        // let rect = svg.getBoundingClientRect();
        // p.x1 -= rect.left;
        // p.y1 -= rect.top;
        // p.x2 -= rect.left;
        // p.y2 -= rect.top;
        // let textPosition = scaleDown(svg, getRelationTextPosition(svg, p.x1, p.y1, p.x2, p.y2));

        // if (page1 !== page2) {

        //   console.log('y1,y2=', y1, y2, page1, page2);

        //   let y1Tmp = convertFromExportY(page1, y1);
        //   let y2Tmp = convertFromExportY(page2, y2);

        //   console.log('y1,y2=', y1Tmp, y2Tmp);

        //   // Specify textbox position.
        //   // let svg = document.querySelector('.annotationLayer');
        //   let svg = document.getElementById('annoLayer'); // TODO make it const.
        //   let p = scaleUp(svg, { x1, y1Tmp, x2, y2Tmp });
        //   let rect = svg.getBoundingClientRect();
        //   p.x1 -= rect.left;
        //   p.y1Tmp -= rect.top;
        //   p.x2 -= rect.left;
        //   p.y2Tmp -= rect.top;
        //   textPosition = scaleDown(svg, getRelationTextPosition(svg, p.x1, p.y1Tmp, p.x2, p.y2Tmp));

        //   let { y, pageNumber } = convertToExportY(textPosition.y);
        //   textPosition.y = y;
        //   textPage = pageNumber;
        // }

        // Add textbox and get the uuid of if.
        // let textId = null;
        // let textContent = data[4];
        // if (textContent) {

        //   textId = uuid();
        //   annotations.push({
        //     class      : 'Annotation',
        //     type       : 'textbox',
        //     uuid       : textId,
        //     page       : textPage,
        //     x          : textPosition.x,
        //     y          : textPosition.y,
        //     content    : textContent,
        //     readOnly,
        //     color
        //   });          
        // }

        // let pageNumber = data[0];

        // Add arrow.
        annotations.push({
          class      : 'Annotation',
          type       : 'arrow',
          direction  : data[1],
          uuid       : uuid(),
          // page       : data[0],
          // x1,
          // y1,
          // x2,
          // y2,
          // page1,
          // page2,
          // text       : textId,
          text : data[4],
          rel1       : rel1.uuid,
          rel2       : rel2.uuid,
          // color      : "FF0000",         // TODO 要る？
          readOnly,
          color
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

      console.log('rec:', r.y, y, pageNumber);
    });
  }

  return annotation;
}

function _getContainers() {
  let containers = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]');
  return containers;
}

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

function _getSecondaryContainers() {

  let containers = _getContainers().filter(c => {
    return !c.isPrimary;
  });

  if (containers.length > 0) {
    return containers;
  } else {    
    return [];
  }

}

function _saveContainer(container) {

  container.isPrimary = true;

  let containers = _getContainers().filter(c => {
    return c.isPrimary === false;
  });

  containers = containers.concat([container]);

  _saveContainers(containers);

}

function _saveContainers(containers) {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(containers));
}

function getAnnotations(documentId) {
  // Primary annotation.
  let container = _getContainer();
  let annotations = (container[documentId] || {}).annotations || [];

  // transform coordinate system.
  annotations = annotations.map(a => transformToRenderCoordinate(a));

  return annotations;
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

  // transform coordinate system.
  annotations = annotations.map(a => transformToRenderCoordinate(a));

  return annotations;
}


function updateAnnotations(documentId, annotations) {

  // Transform coordinate system.
  annotations = annotations.map(a => transformFromRenderCoordinate(a));

  let viewBox = PDFView.pdfViewer.getPageView(0).viewport.viewBox;

  // TODO remove.
  let meta = { w : viewBox[2], h : viewBox[3] };

  let container = _getContainer();
  container[documentId] = { meta, annotations };
  _saveContainer(container);

  // Notifiy.
  var event = document.createEvent('CustomEvent');
  event.initCustomEvent('annotationUpdated', true, true, {});
  window.dispatchEvent(event);
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
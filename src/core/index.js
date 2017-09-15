/**
    Functions for annotations rendered over a PDF file.
*/
require("!style-loader!css-loader!./index.css")

import $ from 'jquery';
import EventEmitter from 'events';


// for Convinience.
window.$ = window.jQuery = $;

window.globalEvent = new EventEmitter();


// This is the entry point of window.xxx.
// (setting from webpack.config.js)
import PDFAnnoCore from './src/PDFAnnoCore';
export default PDFAnnoCore;
// module.exports = PDFAnnoCore;

// Create an annocation container.
import AnnotationContainer from './src/annotation/container';
window.annotationContainer = new AnnotationContainer();

import RectAnnotation from './src/annotation/rect';
import SpanAnnotation from './src/annotation/span';
import RelationAnnotation from './src/annotation/relation';

// Setup Storage.
// PDFAnnoCore.setStoreAdapter(new PDFAnnoCore.PdfannoStoreAdapter());

// Enable a view mode.
PDFAnnoCore.UI.enableViewMode();

// Check Ctrl or Cmd button clicked.
// ** ATTENTION!! ALSO UPDATED by pdfanno.js **
window.ctrlPressed = false;
$(document).on('keydown', e => {

    // Allow any keyboard events for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return;
    }

    if (e.keyCode === 17 || e.keyCode === 91) { // 17:ctrlKey, 91:cmdKey
        window.ctrlPressed = true;
        console.log('ctrl press!!');
    }
}).on('keyup', e => {

    // Allow any keyboard events for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return;
    }

    if (e.keyCode === 49) {  // Digit "1"
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('digit1Pressed', true, true, null);
        window.dispatchEvent(event);
        return;
    }
    if (e.keyCode === 50) {  // Digit "2"
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('digit2Pressed', true, true, null);
        window.dispatchEvent(event);
        return;
    }
    if (e.keyCode === 51) {  // Digit "3"
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('digit3Pressed', true, true, null);
        window.dispatchEvent(event);
        return;
    }
    if (e.keyCode === 52) {  // Digit "4"
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('digit4Pressed', true, true, null);
        window.dispatchEvent(event);
        return;
    }

    window.ctrlPressed = false;
});

// The event called at page rendered by pdfjs.
window.addEventListener('pagerendered', function(ev) {
    console.log('pagerendered:', ev.detail.pageNumber);

    // No action, if the viewer is closed.
    if (!PDFView.pdfViewer.getPageView(0)) {
        return;
    }

    renderAnno();

    // Issue Fix.
    // Correctly rendering when changing scaling.
    // The margin between pages is fixed(9px), and never be scaled in default,
    // then manually have to change the margin.
    let scale = PDFView.pdfViewer.getPageView(0).viewport.scale;
    let borderWidth = `${9 * scale}px`;
    let marginBottom = `${-9 * scale}px`;
    $('.page').css({
        'border-top-width'    : borderWidth,
        'border-bottom-width' : borderWidth,
        'margin-bottom'       : marginBottom
    });
});

// Adapt to scale change.
window.addEventListener('scalechange', () => {
    console.log('scalechange');
    removeAnnoLayer();
    renderAnno();
});

/*
 * Remove the annotation layer and the temporary rendering layer.
 */
function removeAnnoLayer() {
    $('#annoLayer, #tmpLayer').remove();
}
// TODO Refactoring: tricky.
window.removeAnnoLayer = removeAnnoLayer;

/*
 * Render annotations saved in the storage.
 */
function renderAnno() {

    // No action, if the viewer is closed.
    if (!PDFView.pdfViewer.getPageView(0)) {
        return;
    }

    // TODO make it a global const.
    const svgLayerId = 'annoLayer';

    // Check already exists.
    if ($('#' + svgLayerId).length > 0) {
        return;
    }

    let leftMargin = ($('#viewer').width() - $('.page').width()) / 2;

    // At window.width < page.width.
    if (leftMargin < 0) {
        leftMargin = 9;
    }

    let height = $('#viewer').height();

    let width = $('.page').width();

    // Add an annotation layer.
    let $annoLayer = $(`<svg id="${svgLayerId}" class="${svgLayerId}"/>`).css({   // TODO CSSClass.
        position   : 'absolute',
        top        : '0px',
        left       : `${leftMargin}px`,
        width      : `${width}px`,
        height     : `${height}px`,
        visibility : 'hidden',
        'z-index'  : 2
    });
    // Add a tmp layer.
    let $tmpLayer = $(`<div id="tmpLayer"/>`).css({   // TODO CSSClass.
        position : 'absolute',
        top      : '0px',
        left     : `${leftMargin}px`,
        width    : `${width}px`,
        height   : `${height}px`,
        visibility : 'hidden',
        'z-index'  : 2
    });

    $('#viewer').css({
        position : 'relative'
    }).append($annoLayer).append($tmpLayer);

    // Reset.
    // window.annotationContainer.destroy();
    // window.annotationContainer.set = new Set();

    let svg = $annoLayer.get(0);
    let documentId = getFileName(PDFView.url);
    let viewport = PDFView.pdfViewer.getPageView(0).viewport;
    svg.setAttribute('data-pdf-annotate-viewport', JSON.stringify(viewport));
    svg.setAttribute('data-pdf-annotate-document', documentId);
    svg.setAttribute('data-pdf-annotate-page', 1);

    renderAnnotations(svg);
}

// TODO Refactoring: tricky.
window.renderAnno = renderAnno;

function renderAnnotations(svg) {

    console.log('renderAnnotations:', window.annotationContainer.getAllAnnotations().length);

    if (window.annotationContainer.getAllAnnotations().length > 0) {

        window.annotationContainer.getAllAnnotations().forEach(a => {
            a.render();
            a.enableViewMode();

            console.log('annotation:', a);
        });
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('annotationrendered', true, true, null);
        window.dispatchEvent(event);
        return;
    }

    // let documentId = getFileName(PDFView.url);
    // PDFAnnoCore.getAnnotations(documentId).then(function(annotations) {
    //     PDFAnnoCore.getStoreAdapter().getSecondaryAnnotations(documentId).then(function(secondaryAnnotations) {

    //         // Primary + Secondary annotations.
    //         annotations.annotations = annotations.annotations.concat(secondaryAnnotations.annotations);

    //         // Render annotations.
    //         let viewport = PDFView.pdfViewer.getPageView(0).viewport;

    //         annotations.annotations.forEach(a => {

    //             // TODO move to annotation/index.js

    //             let anno = null;


    //             if (a.type === 'area') {
    //                 anno = RectAnnotation.newInstance(a);
    //             } else if (a.type === 'span') {
    //                 anno = SpanAnnotation.newInstance(a);
    //             } else if (a.type === 'relation') {
    //                 anno = RelationAnnotation.newInstance(a);
    //             }

    //             if (anno) {
    //                 anno.render();
    //                 anno.enableViewMode();
    //                 window.annotationContainer.add(anno);
    //             }
    //         });

    //         var event = document.createEvent('CustomEvent');
    //         event.initCustomEvent('annotationrendered', true, true, null);
    //         window.dispatchEvent(event);

    //     });
    // });
}

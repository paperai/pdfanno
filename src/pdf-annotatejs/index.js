require("!style!css!./pdf-annotate.css");
import $ from 'jquery';


// for Convinience.
window.$ = window.jQuery = $;

// The entry point of window.xxx.
// (setting from webpack.config.js)
import PDFJSAnnotate from './src/PDFJSAnnotate';
export default PDFJSAnnotate;

// Alias.
let PDFAnnotate = PDFJSAnnotate;


import AnnotationContainer from './src/annotation/container';
window.annotationContainer = new AnnotationContainer();

import RectAnnotation from './src/annotation/rect';
import HighlightAnnotation from './src/annotation/highlight';
import ArrowAnnotation from './src/annotation/arrow';

import appendChild from './src/render/appendChild';

// Setup Storage.
PDFAnnotate.setStoreAdapter(new PDFAnnotate.PdfannoStoreAdapter());

// The event called at page rendered by pdfjs.
window.addEventListener('pagerendered', function(ev) {
    console.log('pagerendered:', ev.detail.pageNumber);
    renderAnno();
});

// Adapt to scale change.
$(window).on('resize', removeAnnoLayer);
$('#scaleSelect').on('change', removeAnnoLayer);
$('#zoomIn, #zoomOut').on('click', removeAnnoLayer);

/*
 * Remove the annotation layer and the temporary rendering layer.
 */
function removeAnnoLayer() {
    $('#annoLayer, #tmpLayer').remove();
}

/*
 * Render annotations saved in the storage.
 */
function renderAnno() {

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

    let svg = $annoLayer.get(0);
    let documentId = getFileName(PDFView.url);
    let viewport = PDFView.pdfViewer.getPageView(0).viewport;
    svg.setAttribute('data-pdf-annotate-viewport', JSON.stringify(viewport));
    svg.setAttribute('data-pdf-annotate-document', documentId);
    svg.setAttribute('data-pdf-annotate-page', 1);

    renderAnnotations(svg, 1);
}

function renderAnnotations(svg, pageNumber) {
    let documentId = getFileName(PDFView.url);
    PDFAnnotate.getAnnotations(documentId, pageNumber).then(function(annotations) {
        PDFAnnotate.getStoreAdapter().getSecondaryAnnotations(documentId, pageNumber).then(function(secondaryAnnotations) {

            // Primary + Secondary annotations.
            annotations.annotations = annotations.annotations.concat(secondaryAnnotations.annotations);

            // Render annotations.
            let viewport = PDFView.pdfViewer.getPageView(0).viewport;

            annotations.annotations.forEach(a => {

                // TODO move to annotation/index.js
                if (a.type === 'area') {
                    let rect = RectAnnotation.newInstance(a);
                    rect.render();
                    window.annotationContainer.add(rect);
                } else if (a.type === 'highlight') {
                    let highlight = HighlightAnnotation.newInstance(a);
                    highlight.render();
                    window.annotationContainer.add(highlight);                
                } else if (a.type === 'arrow') {
                    let arrowAnnotation = ArrowAnnotation.newInstance(a);
                    arrowAnnotation.render();
                    window.annotationContainer.add(arrowAnnotation);                
                } else {
                    appendChild(svg, a);
                }
            });



            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('annotationrendered', true, true, {
              pageNumber: pageNumber
            });
            window.dispatchEvent(event);

        });
    });
}

function setupPDFDragAndDropLoader() {

    let element = document.querySelector('body');

    $(element).off('dragenter', handleDragEnter);
    $(element).off('dragleave', handleDragLeave);
    $(element).off('dragover', handleDragOver);
    $(element).off('drop', handleDroppedFile);
    $(element).on('dragenter', handleDragEnter);
    $(element).on('dragleave', handleDragLeave);
    $(element).on('dragover', handleDragOver);
    $(element).on('drop', handleDroppedFile);
}
setupPDFDragAndDropLoader();

function handleDroppedFile(e) {

    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('pdfdropped', true, true, { originalEvent: e.originalEvent });
    window.dispatchEvent(event);

    return cancelEvent(e);
}

function handleDragEnter(e) {

    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('pdfdragenter', true, true, { originalEvent: e });
    window.dispatchEvent(event);

    return cancelEvent(e);
}

function handleDragLeave(e) {

    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('pdfdragleave', true, true, { originalEvent: e });
    window.dispatchEvent(event);

    return cancelEvent(e);
}

function handleDragOver(e) {

    // This is the setting to allow D&D for Firefox.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/effectAllowed
    e.originalEvent.dataTransfer.effectAllowed = 'move';

    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('pdfdragover', true, true, { originalEvent: e });
    window.dispatchEvent(event);

    return cancelEvent(e);
}

// Cancel handler
function cancelEvent(e) {
    e.preventDefault();
    return false;
}
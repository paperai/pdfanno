require("!style!css!./pdf-annotate.css");
import $ from 'jquery';

// import { svgLayerId } from './consts';


// The entry point of window.xxx.
// (setting from webpack.config.js)
import PDFJSAnnotate from './src/PDFJSAnnotate';
export default PDFJSAnnotate;

let PDFAnnotate = PDFJSAnnotate;

window.addEventListener('DOMContentLoaded', function() {

    // Setup Storage.
    PDFAnnotate.setStoreAdapter(new PDFAnnotate.PdfannoStoreAdapter());

    // TODO remove.
    // Settings.
    let textSize = 12;
    let textColor = '#FF0000';
    PDFAnnotate.UI.setText(textSize, textColor);


});

window.addEventListener('pagerendered', function(ev) {
    console.log('pagerendered:', ev.detail.pageNumber);
    renderAnno();
});

window.addEventListener('resize', function () {
    $('#annoLayer').remove();
    $('#tmpLayer').remove();
});

document.getElementById('scaleSelect').addEventListener('change', function() {
    console.log('scaleChanged');
    $('#annoLayer').remove();
    $('#tmpLayer').remove();
});

function renderAnno() {

    // TODO make it a global const.
    const svgLayerId = 'annoLayer';

    // Check already exists.
    if ($('#' + svgLayerId).length > 0) {
        return;
    }

    let leftMargin = ($('#viewer').width() - $('.page').width()) / 2;
    console.log('leftMargin:', leftMargin);

    let height = $('#viewer').height();

    // Add an annotation layer.
    let $annoLayer = $(`<svg id="${svgLayerId}"/>`).css({   // TODO CSSClass.
        position : 'absolute',
        // top      : '9px',
        top      : '0px',
        left     : `${leftMargin}px`,
        width    : `calc(100% - ${leftMargin*2}px`,
        // height   : `${height-9}px`,
        height   : `${height}px`,
        visibility : 'hidden',
        'z-index'  : 2
    });
    // Add a tmp layer.
    let $tmpLayer = $(`<div id="tmpLayer"/>`).css({   // TODO CSSClass.
        position : 'absolute',
        top      : '0px',
        left     : `${leftMargin}px`,
        width    : `calc(100% - ${leftMargin*2}px`,
        // height   : `${height-9}px`,
        height   : `${height}px`,
        visibility : 'hidden',
        'z-index'  : 2
    });
    // $('#viewerContainer').append($annoLayer);
    // $('#pageContainer1').css({
    $('#viewer').css({
        position : 'relative'
    }).append($annoLayer).append($tmpLayer);

    let svg = $annoLayer.get(0);
    let documentId = getFileName(PDFView.url);
    let viewport = PDFView.pdfViewer.getPageView(0).viewport;
    svg.setAttribute('data-pdf-annotate-viewport', JSON.stringify(viewport));
    svg.setAttribute('data-pdf-annotate-document', documentId);
    svg.setAttribute('data-pdf-annotate-page', 1);

    // Import user uploading annotation, if exists.
    if (uploadedAnnotationExists()) {
        importUploadedAnnotation().then(() => {
            renderAnnotations(svg, 1);
        });
    } else {
        renderAnnotations(svg, 1);
    }
}

function renderAnnotations(svg, pageNumber) {
    let documentId = getFileName(PDFView.url);
    PDFAnnotate.getAnnotations(documentId, pageNumber).then(function(annotations) {
        PDFAnnotate.getStoreAdapter().getSecondaryAnnotations(documentId, pageNumber).then(function(secondaryAnnotations) {

            // Primary + Secondary annotations.
            annotations.annotations = annotations.annotations.concat(secondaryAnnotations.annotations);

            // Render annotations.
            let viewport = PDFView.pdfViewer.getPageView(0).viewport;
            PDFAnnotate.render(svg, viewport, annotations);

            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('annotationrendered', true, true, {
              pageNumber: pageNumber
            });
            window.dispatchEvent(event);
        });
    });
}

function uploadedAnnotationExists() {
    let item = localStorage.getItem('_pdfanno_pdfanno_upload');
    let itemSecondary = localStorage.getItem('_pdfanno_pdfanno_upload_second');
    return item || itemSecondary;
}

function importUploadedAnnotation() {
    
    let actions = [];

    // Primary Annotation.
    if (localStorage.getItem('_pdfanno_pdfanno_upload')) {
        console.log('LOAD PRIMARY');
        let annotations = JSON.parse(localStorage.getItem('_pdfanno_pdfanno_upload'));
        console.log('importUploadedAnnotation:', annotations);
        let promise = PDFAnnotate.getStoreAdapter().importData(annotations).then(() => {
            localStorage.removeItem('_pdfanno_pdfanno_upload');
        });
        actions.push(promise);
    }

    // Seconday Annotations.
    if (localStorage.getItem('_pdfanno_pdfanno_upload_second')) {
        console.log('LOAD SECONDARY');
        let secondAnnotations = JSON.parse(localStorage.getItem('_pdfanno_pdfanno_upload_second'));
        console.log('secondAnnotations:', secondAnnotations);
        let promise = PDFAnnotate.getStoreAdapter().importDataSecondary(secondAnnotations).then(() => {
            localStorage.removeItem('_pdfanno_pdfanno_upload_second');
        });
        actions.push(promise);
    }

    return Promise.all(actions);
}
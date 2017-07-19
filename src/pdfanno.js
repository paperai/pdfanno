require("file-loader?name=dist/index.html!./index.html");

// UI parts.
import * as annoUI from 'anno-ui';

import { dispatchWindowEvent } from './shared/util';
import { convertToExportY, getPageSize, paddingBetweenPages } from './shared/coords';
import {
    listenWindowLeaveEvent,
    unlistenWindowLeaveEvent,
    resizeHandler
} from './page/util/window';
import * as publicApi from './page/public';
import PDFAnnoPage from './page/pdf/PDFAnnoPage';

/**
 * API root point.
 */
let API_ROOT = 'http://localhost:3000';
if (process.env.NODE_ENV === 'production') {
    console.log('PRODUCTION MODE');
    API_ROOT = 'https://pdfanno.hshindo.com';
}

/**
 * Global variable.
 */
window.pdfanno = {};

/**
 * Expose public APIs.
 */
window.add = publicApi.addAnnotation;
window.addAll = publicApi.addAllAnnotations;
window.delete = publicApi.deleteAnnotation;
window.RectAnnotation = publicApi.PublicRectAnnotation;
window.SpanAnnotation = publicApi.PublicSpanAnnotation;
window.RelationAnnotation = publicApi.PublicRelationAnnotation;
window.readTOML = publicApi.readTOML;
window.clear = publicApi.clear;

/**
 * Annotation functions for a page.
 */
window.annoPage = new PDFAnnoPage();


// Manage ctrlKey (cmdKey on Mac).
window.addEventListener('manageCtrlKey', e => {
    window.annoPage.manageCtrlKey(e.detail);
});

// Manage digitKey.
window.addEventListener('digitKeyPressed', e => {
    dispatchWindowEvent(`digit${e.detail}Pressed`);
});

/**
 * Get the y position in the annotation.
 */
function _getY(annotation) {

    if (annotation.rectangles) {
        return annotation.rectangles[0].y;

    } else if (annotation.y1) {
        return annotation.y1;

    } else {
        return annotation.y;
    }
}

/**
 *  The entry point.
 */
window.addEventListener('DOMContentLoaded', e => {

    // Delete prev annotations.
    window.annoPage.clearAllAnnotations();

    // Reset PDFViwer settings.
    // window.annoPage.resetPDFViewerSettings();

    // resizable.
    annoUI.util.setupResizableColumns();

    // Start event listeners.
    annoUI.event.setup();

    // Browse button.
    annoUI.browseButton.setup({
        loadFiles : window.annoPage.loadFiles,
        clearAllAnnotations : window.annoPage.clearAllAnnotations,
        displayCurrentReferenceAnnotations : () => window.annoPage.displayAnnotation(false, false),
        displayCurrentPrimaryAnnotations : () => window.annoPage.displayAnnotation(true, false),
        getContentFiles : () => window.annoPage.contentFiles,
        getAnnoFiles : () => window.annoPage.annoFiles,
        closePDFViewer : window.annoPage.closePDFViewer
    });

    // PDF dropdown.
    annoUI.contentDropdown.setup({
        initialText : 'PDF File',
        overrideWarningMessage : 'Are you sure to load another PDF ?',
        contentReloadHandler : fileName => {

            // Get the content.
            const content = window.annoPage.getContentFile(fileName);

            // Reset annotations displayed.
            window.annoPage.clearAllAnnotations();

            // Display the PDF on the viewer.
            window.annoPage.displayViewer(content);
        }
    });

    // Primary anno dropdown.
    annoUI.primaryAnnoDropdown.setup({
        clearPrimaryAnnotations : window.annoPage.clearAllAnnotations,
        displayPrimaryAnnotation : annoName => window.annoPage.displayAnnotation(true)
    });

    // Reference anno dropdown.
    annoUI.referenceAnnoDropdown.setup({
        displayReferenceAnnotations : annoNames =>window.annoPage.displayAnnotation(false)
    });

    // Anno list dropdown.
    annoUI.annoListDropdown.setup({
        getAnnotations : () => {

            // Get displayed annotations.
            let annotations = window.annoPage.getAllAnnotations();

            // Filter only Primary.
            annotations = annotations.filter(a => {
                return !a.readOnly;
            });

            // Sort by offsetY.
            annotations = annotations.sort((a1, a2) => {
                return _getY(a1) - _getY(a2);
            });

            return annotations;
        },
        scrollToAnnotation : id => {

            let annotation = window.annoPage.findAnnotationById(id);

            if (annotation) {

                // scroll to.
                let _y = annotation.y || annotation.y1 || annotation.rectangles[0].y;
                let { pageNumber, y } = convertToExportY(_y);
                let pageHeight = window.annoPage.getViewerViewport().height;
                let scale = window.annoPage.getViewerViewport().scale;
                _y = (pageHeight + paddingBetweenPages) * (pageNumber - 1) + y * scale;
                _y -= 100;
                $('#viewer iframe').contents().find('#viewer').parent()[0].scrollTop = _y;

                // highlight.
                annotation.highlight();
                setTimeout(() => {
                    annotation.dehighlight();
                }, 1000);
            }
        }
    });

    // Download button.
    annoUI.downloadButton.setup({
        getAnnotationTOMLString : window.annoPage.exportData,
        getCurrentContentName   : window.annoPage.getCurrentContentName,
        unlistenWindowLeaveEvent : unlistenWindowLeaveEvent
    });

    // AnnoTool: rect.
    annoUI.annoRectButton.setup({
        enableRect : window.annoPage.enableRect,
        disableRect : window.annoPage.disableRect,
    });

    // AnnoTool: span.
    annoUI.annoSpanButton.setup({
        createSpanAnnotation : window.annoPage.createSpan
    });

    // AnnoTool: relation.
    annoUI.annoRelButton.setup({
        createRelAnnotation : window.annoPage.createRelation
    });

    // Label input.
    annoUI.labelInput.setup({
        getSelectedAnnotations : window.annoPage.getSelectedAnnotations,
        saveAnnotationText : (id, text) => {
            console.log('saveAnnotationText:', id, text);
            const annotation = window.annoPage.findAnnotationById(id);
            if (annotation) {
                annotation.text = text;
                annotation.save();
                annotation.enableViewMode();
            }
        }
    });

    // Upload button.
    annoUI.uploadButton.setup({
        getCurrentDisplayContentFile : () => {
            const pdfFileName = $('#dropdownPdf .js-text').text();
            if (!pdfFileName || pdfFileName === 'PDF File') {
                return null;
            }
            return window.annoPage.getContentFile(pdfFileName);
        }
    });

    // Display a PDF specified via URL query parameter.

    let pdfURL;
    (location.search || '').replace('?', '').split('&')
        .filter(a => a)
        .forEach(fragment => {
            let [ key, value ] = fragment.split('=');
            if (key && key.toLowerCase() === 'pdf') {
                pdfURL = value;
            }
    });

    if (pdfURL) {

        console.log('pdfURL=', pdfURL);

        // Show loading.
        $('#pdfLoading').removeClass('hidden');

        // Load a PDF as ArrayBuffer.
        var xhr = new XMLHttpRequest();
        xhr.open('GET', API_ROOT + '/load_pdf?url=' + window.encodeURIComponent(pdfURL), true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            if (this.status === 200) {

                // Init viewer.
                window.annoPage.initializeViewer(null);
                // Start application.
                window.annoPage.startViewerApplication();

                window.addEventListener('iframeReady', () => {
                    setTimeout(() => {
                        window.annoPage.displayViewer({ content : this.response });
                    }, 500);
                });

                window.addEventListener('pagerendered', () => {
                    $('#pdfLoading').addClass('close');
                    setTimeout(function() {
                        $('#pdfLoading').addClass('hidden');
                    }, 1000);
                });
            }
        };
        xhr.timeout = 10000; // 10s
        xhr.ontimeout = function () {
            alert('Failed to load the PDF.');
        };
        xhr.send();

    } else {

        // If no PDF is specified, display the blank viewer.

        $('#viewer').css('opacity', '0');

        // Init viewer.
        window.annoPage.initializeViewer();
        // Start application.
        window.annoPage.startViewerApplication();

        window.addEventListener('pagerendered', () => {
            window.annoPage.closePDFViewer();
            $('#viewer').css('opacity', '1');
        });
    }

});

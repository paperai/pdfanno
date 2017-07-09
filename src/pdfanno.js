require("file-loader?name=dist/index.html!./index.html");
require("!style-loader!css-loader!./pdfanno.css");

import { dispatchWindowEvent } from './shared/util';

import { convertToExportY, getPageSize, paddingBetweenPages } from './shared/coords';

// UIs.
// import * as annoUI from 'anno-ui';
// require('anno-ui');
// require('index');

// import * as annoUI from 'anno-ui';
// console.log('annoUI: ', annoUI, annoUI.browseButton);

// UIs.
import * as annoUI from 'anno-ui';



// TODO ファイル自体も削除.
// UIs.
// import * as browseButton from './page/ui/browseButton';
// import * as pdfDropdown from './page/ui/pdfDropdown';
// import * as primaryAnnoDropdown from './page/ui/primaryAnnoDropdown';
// import * as annoListDropdown from './page/ui/annoListDropdown';
// import * as referenceAnnoDropdown from './page/ui/referenceAnnoDropdown';
// import * as downloadButton from './page/ui/downloadButton';
// import * as uploadButton from './page/ui/uploadButton';
// import * as annotationTools from './page/ui/annotationTools';
// import * as inputLabel from './page/ui/inputLabel';

import {
    listenWindowLeaveEvent,
    unlistenWindowLeaveEvent,
    resizeHandler,
    setupResizableColumns
} from './page/util/window';

import * as publicApi from './page/public';

import PDFAnnoPage from './page/pdf/PDFAnnoPage';

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
 * Annotation functions for Page.
 */
window.annoPage = new PDFAnnoPage();


// Check Ctrl or Cmd button clicked.
// ** ATTENTION!! ALSO UPDATED by core/index.js **
$(document).on('keydown', e => {

    if (e.keyCode === 17 || e.keyCode === 91) { // 17:ctrlKey, 91:cmdKey
        window.annoPage.manageCtrlKey('on');
    }

}).on('keyup', e => {

    // Allow any keyboard events for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return;
    }

    window.annoPage.manageCtrlKey('off');

    if (e.keyCode === 49) {         // Digit "1"
        dispatchWindowEvent('digit1Pressed');
    } else if (e.keyCode === 50) {  // Digit "2"
        dispatchWindowEvent('digit2Pressed');
    } else if (e.keyCode === 51) {  // Digit "3"
        dispatchWindowEvent('digit3Pressed');
    } else if (e.keyCode === 52) {  // Digit "4"
        dispatchWindowEvent('digit4Pressed');
    }
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

    // Init viewer.
    window.annoPage.initializeViewer();

    // Delete prev annotations.
    window.annoPage.clearAllAnnotations();

    // Reset PDFViwer settings.
    window.annoPage.resetPDFViewerSettings();

    // Start application.
    window.annoPage.startViewerApplication();

    // Setup UI parts.
    // browseButton.setup();
    // pdfDropdown.setup();
    // primaryAnnoDropdown.setup();
    // referenceAnnoDropdown.setup();
    // annoListDropdown.setup();
    // downloadButton.setup();
    // uploadButton.setup();
    // annotationTools.setup();
    // inputLabel.setup();

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
        getCurrentContentName   : window.annoPage.getCurrentContentName
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
        },
    });


    window.addEventListener('restartApp', window.annoPage.startViewerApplication);

    // resizable.
    setupResizableColumns();

});

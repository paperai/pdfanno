require("file?name=dist/index.html!./index.html");
require("!style!css!./pdfanno.css");

import { dispatchWindowEvent } from './shared/util';

// UIs.
// import * as annoUI from 'anno-ui';
// require('anno-ui');
// require('index');

// import * as annoUI from 'anno-ui';
// console.log('annoUI: ', annoUI, annoUI.browseButton);

import annoUI from 'anno-ui';



// UIs.
import * as browseButton from './page/ui/browseButton';
import * as pdfDropdown from './page/ui/pdfDropdown';
import * as primaryAnnoDropdown from './page/ui/primaryAnnoDropdown';
import * as annoListDropdown from './page/ui/annoListDropdown';
import * as referenceAnnoDropdown from './page/ui/referenceAnnoDropdown';
import * as downloadButton from './page/ui/downloadButton';
import * as uploadButton from './page/ui/uploadButton';
import * as annotationTools from './page/ui/annotationTools';
import * as inputLabel from './page/ui/inputLabel';

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
    browseButton.setup();
    pdfDropdown.setup();
    primaryAnnoDropdown.setup();
    referenceAnnoDropdown.setup();
    annoListDropdown.setup();
    downloadButton.setup();
    uploadButton.setup();
    annotationTools.setup();
    inputLabel.setup();

    window.addEventListener('restartApp', window.annoPage.startViewerApplication);

    // resizable.
    setupResizableColumns();

});

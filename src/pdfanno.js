require("file?name=dist/index.html!./index.html");
require("!style!css!./pdfanno.css");

import * as browseButton from './page/ui/browseButton';
import * as pdfDropdown from './page/ui/pdfDropdown';
import * as primaryAnnoDropdown from './page/ui/primaryAnnoDropdown';
import * as annoListDropdown from './page/ui/annoListDropdown';
import * as referenceAnnoDropdown from './page/ui/referenceAnnoDropdown';

import * as annotationsTools from './page/ui/annotationTools';

import {
    displayAnnotation,
    reloadPDFViewer,
    clearAllAnnotations,
    setupColorPicker
} from './page/util/display';


/**
 * The data which is loaded via `Browse` button.
 */
window.fileMap = {};

/**
 * Resize the height of elements adjusting to the window.
 */
function resizeHandler() {

    // PDFViewer.
    let height = $(window).innerHeight() - $('#viewer').offset().top;
    $('#viewer iframe').css('height', `${height}px`);

    // Dropdown for PDF.
    let height1 = $(window).innerHeight() - ($('#dropdownPdf ul').offset().top || 120);
    $('#dropdownPdf ul').css('max-height', `${height1 - 20}px`);

    // Dropdown for Primary Annos.
    let height2 = $(window).innerHeight() - ($('#dropdownAnnoPrimary ul').offset().top || 120);
    $('#dropdownAnnoPrimary ul').css('max-height', `${height2 - 20}px`);

    // Dropdown for Anno list.
    let height3 = $(window).innerHeight() - ($('#dropdownAnnoList ul').offset().top || 120);
    $('#dropdownAnnoList ul').css('max-height', `${height3 - 20}px`);

    // Dropdown for Reference Annos.
    let height4 = $(window).innerHeight() - ($('#dropdownAnnoReference ul').offset().top || 120);
    $('#dropdownAnnoReference ul').css('max-height', `${height4 - 20}px`);

}

/**
    Adjust the height of viewer according to window height.
*/
function adjustViewerSize() {
    window.removeEventListener('resize', resizeHandler);
    window.addEventListener('resize', resizeHandler);
    resizeHandler();
}

function _getDownloadFileName() {

    // The name of Primary Annotation.
    let primaryAnnotationName;
    $('#dropdownAnnoPrimary a').each((index, element) => {
        let $elm = $(element);
        if ($elm.find('.fa-check').hasClass('no-visible') === false) {
            primaryAnnotationName = $elm.find('.js-annoname').text();
        }
    });
    if (primaryAnnotationName) {
        return primaryAnnotationName;
    }

    // The name of PDF.
    let pdfFileName = iframeWindow.getFileName(iframeWindow.PDFView.url);
    return pdfFileName.split('.')[0] + '.anno';
}

/**
 * Export the primary annotation data for download.
 */
function downloadAnnotation() {

    window.iframeWindow.PDFAnnoCore.getStoreAdapter().exportData().then(annotations => {
        let blob = new Blob([annotations]);
        let blobURL = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        document.body.appendChild(a); // for firefox working correctly.
        a.download = _getDownloadFileName();
        a.href = blobURL;
        a.click();
        a.parentNode.removeChild(a);
    });

    unlistenWindowLeaveEvent();
}

/**
 * Delete all annotations.
 */
function deleteAllAnnotations() {

    // Comfirm to user.
    let userAnswer = window.confirm('Are you sure to clear the current annotations?');
    if (!userAnswer) {
        return;
    }

    iframeWindow.annotationContainer.destroy();

    let documentId = window.iframeWindow.getFileName(window.iframeWindow.PDFView.url);
    window.iframeWindow.PDFAnnoCore.getStoreAdapter().deleteAnnotations(documentId).then(() => {
        reloadPDFViewer();
    });
}

/**
 * Set the confirm dialog at leaving the page.
 */
function listenWindowLeaveEvent() {
    $(window).off('beforeunload').on('beforeunload', () => {
        return 'You don\'t save the annotations yet.\nAre you sure to leave ?';
    });
}

/**
 * Unset the confirm dialog at leaving the page.
 */
function unlistenWindowLeaveEvent() {
    $(window).off('beforeunload');
}

/**
 * Start PDFAnno Application.
 */
function startApplication() {

    // Alias for convenience.
    window.iframeWindow = $('#viewer iframe').get(0).contentWindow;

    iframeWindow.addEventListener('DOMContentLoaded', () => {

        // Adjust the height of viewer.
        adjustViewerSize();

        // Initialize tool buttons' behavior.
        // initializeAnnoToolButtons();
        annotationsTools.setup1();

        // Reset the confirm dialog at leaving page.
        unlistenWindowLeaveEvent();
    });

    // Set viewMode behavior after annotations rendered.
    iframeWindow.addEventListener('annotationrendered', () => {
        // window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
        window.iframeWindow.PDFAnnoCore.UI.enableViewMode();
    });

    // Set the confirm dialog at page leaving.
    iframeWindow.addEventListener('annotationUpdated', listenWindowLeaveEvent);
}

/**
 *  The entry point.
 */
window.addEventListener('DOMContentLoaded', e => {

    // Delete prev annotations.
    if (location.search.indexOf('debug') === -1) {
        clearAllAnnotations();
    }

    // Start application.
    startApplication();

    // Setup loading tools for PDFs and Anno files.
    // setupBrowseButton();
    browseButton.setup();
    // setupPdfDropdown();
    pdfDropdown.setup();

    primaryAnnoDropdown.setup();
    referenceAnnoDropdown.setup();
    annoListDropdown.setup();
    // setupAnnoListDropdown();

    window.addEventListener('restartApp', startApplication);
});

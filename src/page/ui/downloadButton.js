/**
 * UI parts - Download Button.
 */
import { unlistenWindowLeaveEvent } from '../util/window';

/**
 * Setup the behavior of a Download Button.
 */
export function setup() {

    $('#downloadButton').off('click').on('click', e => {

        $(e.currentTarget).blur();

        downloadAnnotation();

        return false;
    });

}


/**
 * Export the primary annotation data for download.
 */
function downloadAnnotation() {

    // TODO UIとの分離.
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
 * Get the file name for download.
 */
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

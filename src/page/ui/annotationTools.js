/**
 * UI parts - Annotations Tools.
 */
import { reloadPDFViewer } from '../util/display';
import { unlistenWindowLeaveEvent } from '../util/window';
import { enableAnnotateTool, disableAnnotateTools } from '../util/anno';


/**
    Set the behavior of the tool buttons for annotations.
*/
export function setup() {

    window.currentAnnoToolType = 'view';

    $('.js-tool-btn').off('click').on('click', (e) => {

        disableAnnotateTools();

        let $button = $(e.currentTarget);

        if ($button.hasClass('active')) {
            $button
                .removeClass('active')
                .blur();
            return false;
        }

        $('.js-tool-btn.active').removeClass('active');
        $button.addClass('active');

        let type = $button.data('type');

        window.currentAnnoToolType = type;

        enableAnnotateTool(type);

        return false;
    });

    $('.js-tool-btn2').off('click').on('click', (e) => {

        let $button = $(e.currentTarget);
        let type = $button.data('type');

        $button.blur();

        if (type === 'download') {
            downloadAnnotation();
        }

        return false;
    });

    $('.js-tool-btn-span').off('click').on('click', e => {
        $(e.currentTarget).blur();
        const result = window.iframeWindow.PDFAnnoCore.UI.createSpan();
        if (!result) {
            alert('Please select a text span first.');
        }
    });

    $('.js-tool-btn-rel').off('click').on('click', e => {

        const $button = $(e.currentTarget);
        const type = $button.data('type');

        let selectedAnnotations = window.iframeWindow.annotationContainer.getSelectedAnnotations();
        selectedAnnotations = selectedAnnotations.filter(a => {
            return a.type === 'area' || a.type === 'span';
        }).sort((a1, a2) => {
            return (a1.selectedTime - a2.selectedTime); // asc
        });

        if (selectedAnnotations.length < 2) {
            return alert('Please select two annotations first.');
        }

        const first  = selectedAnnotations[selectedAnnotations.length - 2];
        const second = selectedAnnotations[selectedAnnotations.length - 1];

        console.log('first:second,', first, second);

        window.iframeWindow.PDFAnnoCore.UI.createRelation(type, first, second);

        $button.blur();
    });

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
 * Get the anno file name for download.
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

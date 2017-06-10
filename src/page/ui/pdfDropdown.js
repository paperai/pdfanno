/**
 * UI parts - PDF Dropdown.
 */
import { reloadPDFViewer } from '../util/display';
import { resetCheckPrimaryAnnoDropdown, resetCheckReferenceAnnoDropdown } from '../util/dropdown';

// TODO Refactoring.

/**
 * Setup the dropdown of PDFs.
 */
export function setup() {

    $('#dropdownPdf').on('click', 'a', e => {

        let $this = $(e.currentTarget);
        // TODO pdfPath to name.
        // TODO js-pdfname to js-content-name
        let pdfPath = $this.find('.js-pdfname').text();

        let currentPDFName = $('#dropdownPdf .js-text').text();
        if (currentPDFName === pdfPath) {
            console.log('Not reload. the pdf are same.');
            return;
        }

        // Confirm to override.
        if (currentPDFName !== 'PDF File') {
            if (!window.confirm('Are you sure to load another PDF ?')) {
                return;
            }
        }

        $('#dropdownPdf .js-text').text(pdfPath);

        $('#dropdownPdf .fa-check').addClass('no-visible');
        $this.find('.fa-check').removeClass('no-visible');

        // if (!window.pdfanno.fileMap[pdfPath]) {
        //     return false;
        // }

        const content = window.annoPage.getContentFile(pdfPath);
        if (!content) {
            return false;
        }

        // Reset Primary/Reference anno dropdowns, and data.
        window.annoPage.clearAllAnnotations();
        resetCheckPrimaryAnnoDropdown();
        resetCheckReferenceAnnoDropdown();

        // reload.
        // window.pdf = window.pdfanno.fileMap[pdfPath];
        // let fileName = pdfPath.split('/')[pdfPath.split('/').length - 1];
        // window.pdfName = fileName;
        window.pdf = content.content;
        window.fileName = content.name;
        reloadPDFViewer();

        // Close dropdown.
        $('#dropdownPdf').click();

        return false;
    });
}

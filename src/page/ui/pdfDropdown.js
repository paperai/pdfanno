/**
 * UI parts - PDF Dropdown.
 */
import { reloadPDFViewer } from '../util/display';
import { clearAllAnnotations } from '../util/anno';
import { resetCheckPrimaryAnnoDropdown, resetCheckReferenceAnnoDropdown } from '../util/dropdown';

/**
 * Setup the dropdown of PDFs.
 */
export function setup() {

    $('#dropdownPdf').on('click', 'a', e => {

        let $this = $(e.currentTarget);
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

        if (!fileMap[pdfPath]) {
            return false;
        }

        // Reset Primary/Reference anno dropdowns, and data.
        clearAllAnnotations();
        resetCheckPrimaryAnnoDropdown();
        resetCheckReferenceAnnoDropdown();

        // reload.
        window.pdf = fileMap[pdfPath];
        let fileName = pdfPath.split('/')[pdfPath.split('/').length - 1];
        window.pdfName = fileName;
        reloadPDFViewer();

        // Close dropdown.
        $('#dropdownPdf').click();

        return false;
    });
}

/**
 * UI parts - PDF Dropdown.
 */
import { reloadPDFViewer } from '../util/display';

/**
 * Setup the dropdown of PDFs.
 */
export function setup() {

    $('#dropdownPdf').on('click', 'a', e => {

        const $this = $(e.currentTarget);

        // Get the name of PDF clicked.
        const pdfName = $this.find('.js-content-name').text();

        // Get the name of PDF currently displayed.
        const currentPDFName = $('#dropdownPdf .js-text').text();

        // No action, if the current PDF is selected.
        if (currentPDFName === pdfName) {
            console.log('Not reload. the pdf are same.');
            return;
        }

        // Confirm to override.
        if (currentPDFName !== 'PDF File') {
            if (!window.confirm('Are you sure to load another PDF ?')) {
                return;
            }
        }

        // Update PDF's name displayed.
        $('#dropdownPdf .js-text').text(pdfName);

        // Update the dropdown selection.
        $('#dropdownPdf .fa-check').addClass('no-visible');
        $this.find('.fa-check').removeClass('no-visible');

        // Get the content.
        const content = window.annoPage.getContentFile(pdfName);
        if (!content) {
            return false;
        }

        // Reset annotations displayed.
        window.annoPage.clearAllAnnotations();

        // Reset annotations' dropdowns.
        resetCheckPrimaryAnnoDropdown();
        resetCheckReferenceAnnoDropdown();

        // Display the PDF on the viewer.
        window.annoPage.displayViewer(content);

        // Close dropdown.
        $('#dropdownPdf').click();

        return false;
    });
}

/**
 * Reset the primary annotation dropdown selection.
 */
function resetCheckPrimaryAnnoDropdown() {
    $('#dropdownAnnoPrimary .js-text').text('Anno File');
    $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
}

/**
 * Reset the reference annotation dropdown selection.
 */
function resetCheckReferenceAnnoDropdown() {
    $('#dropdownAnnoReference .js-text').text('Reference Files');
    $('#dropdownAnnoReference .fa-check').addClass('no-visible');
}

/**
 * UI parts - Upload Button.
 */

export function setup() {
    $('.js-btn-upload').off('click').on('click', () => {

        const pdfFileName = $('#dropdownPdf .js-text').text();
        if (!pdfFileName || pdfFileName === 'PDF File') {
            return alert('Display a PDF, before upload.');
        }

        const contentBase64 = window.fileMap[pdfFileName];

        $.ajax({
            url : '/api/pdf_upload',
            method : 'POST',
            dataType : 'json',
            data : { name : pdfFileName, content : contentBase64 }
        }).then(result => {
            console.log('result:', result);
        });

        return false;
    });
}

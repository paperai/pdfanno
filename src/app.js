require("file?name=dist/index.html!./index.html");
require("!style!css!./app.css");

/**
 * Resize the height of PDFViewer adjusting to the window.
 */
function resizeHandler() {
    let height = $(window).innerHeight() - $('#viewer').offset().top;
    $('#viewer iframe').css('height', `${height}px`);
}

/**
    Adjust the height of viewer according to window height.
*/
function adjustViewerSize() {
    window.removeEventListener('resize', resizeHandler);
    window.addEventListener('resize', resizeHandler);
    resizeHandler();
}

/**
    Disable annotation tool buttons.
*/
function disableAnnotateTools() {
    window.iframeWindow.PDFAnnotate.UI.disableRect();
    window.iframeWindow.PDFAnnotate.UI.disableHighlight();
    window.iframeWindow.PDFAnnotate.UI.disableText();
    window.iframeWindow.PDFAnnotate.UI.disableArrow();
    window.iframeWindow.PDFAnnotate.UI.disableViewMode();
}

/**
    Set the behavior of the tool buttons for annotations.
*/
let _viewMode = false;
function initializeAnnoToolButtons() {

    $('.js-tool-btn').off('click').on('click', (e) => {

        let $button = $(e.currentTarget);
        let type = $button.data('type');

        $('.js-tool-btn').removeClass('active');
        $button.addClass('active');

        disableAnnotateTools();

        _viewMode = false;

        if (type === 'view') {
            _viewMode = true;
            window.iframeWindow.PDFAnnotate.UI.enableViewMode();
        
        } else if (type === 'highlight') {
            window.iframeWindow.PDFAnnotate.UI.enableHighlight();
        
        } else if (type === 'arrow') {
            window.iframeWindow.PDFAnnotate.UI.enableArrow('one-way');
        
        } else if (type === 'arrow-two-way') {
            window.iframeWindow.PDFAnnotate.UI.enableArrow('two-way');

        } else if (type === 'link') {
            window.iframeWindow.PDFAnnotate.UI.enableArrow('link');

        } else if (type === 'rect') {
            window.iframeWindow.PDFAnnotate.UI.enableRect();
        
        } else if (type === 'text') {
            window.iframeWindow.PDFAnnotate.UI.enableText();
        }

        return false;
    });

    $('.js-tool-btn2').off('click').on('click', (e) => {

        let $button = $(e.currentTarget);
        let type = $button.data('type');

        $button.blur();
        
        if (type === 'download') {
            downloadAnnotation();
        
        } else if (type === 'delete') {
            deleteAllAnnotations();            
        }

        return false;
    });

    $('.js-tool-btn[data-type="view"]').click();
}

function downloadAnnotation() {

    window.iframeWindow.PDFAnnotate.getStoreAdapter().exportData().then(annotations => {
        annotations = JSON.stringify(annotations, null, '\t');
        let blob = new Blob([annotations]);
        let blobURL = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        document.body.appendChild(a); // for firefox working correctly.
        a.download = 'pdf.anno';
        a.href = blobURL;
        a.click();
        a.parentNode.removeChild(a);
    });
}

/**
 * Delete all annotations.
 */
function deleteAllAnnotations() {
    let documentId = window.iframeWindow.getFileName(window.iframeWindow.PDFView.url);
    window.iframeWindow.PDFAnnotate.getStoreAdapter().deleteAnnotations(documentId).then(() => {
        
        // Reload pdf.js.
        $('#viewer iframe').remove();
        $('#viewer').html('<iframe src="./pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');

        // Restart.
        startApplication();
    });
}

/**
    Set the behaviors of file inputs.
*/
let _paperName = null;
let _paperData = null;
let _primaryAnnotation = null;
let _secondaryAnnotations = [];
function initializeFileUploader() {
    setupPaperButton();
    setupPrimaryAnnotationButton();
    setupSecondaryAnnotationButton();
    setupLoadButton();
}

/**
    Setup the behavior of the paper button.
*/
function setupPaperButton() {

    $('#paper').off('change').on('change', e => {
        
        let files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        let fileReader = new FileReader();
        fileReader.onload = event => {
            _paperName = files[0].name;
            _paperData = event.target.result;
        }
        fileReader.readAsDataURL(files[0]);
    });
}

function setupPrimaryAnnotationButton() {

    // The primary annotations.
    $('#primary-anno').off('change').on('change', e => {

        let files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        let file = files[0];

        let fileReader = new FileReader();
        fileReader.onload = event => {
            _primaryAnnotation = event.target.result;
        }
        fileReader.readAsText(file);

    });
}

function setupSecondaryAnnotationButton() {
    // The secondary annotations.
    $('#secondary-anno').off('change').on('change', e => {

        let files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        _secondaryAnnotations = [];

        Array.prototype.forEach.call(files, file => {
            let fileReader = new FileReader();
            fileReader.onload = event => {
                _secondaryAnnotations.push(JSON.parse(event.target.result));
            }
            fileReader.readAsText(file);
        });
    });
}

function setupLoadButton() {
    $('#load').off('click').on('click', e => {

        // Set data.
        _paperName && localStorage.setItem('_pdfanno_pdfname', _paperName);
        _paperData && localStorage.setItem('_pdfanno_pdf', _paperData);
        _primaryAnnotation && localStorage.setItem('_pdfanno_pdfanno_upload', _primaryAnnotation);
        _secondaryAnnotations && localStorage.setItem('_pdfanno_pdfanno_upload_second', JSON.stringify(_secondaryAnnotations));

        // Reload pdf.js.
        $('#viewer iframe').remove();
        $('#viewer').html('<iframe src="./pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');

        // Re-setup.
        startApplication();
    });
}

function startApplication() {

    // Alias for convenience.
    window.iframeWindow = $('#viewer iframe').get(0).contentWindow;

    iframeWindow.addEventListener('DOMContentLoaded', () => {

        // Adjust the height of viewer.
        adjustViewerSize();

        // Initialize tool buttons' behavior.
        initializeAnnoToolButtons();

        // Set the behaviors of file inputs.
        initializeFileUploader();            
    });

    iframeWindow.addEventListener('annotationrendered', (ev) => {
        console.log('annotationrendered', ev.detail.pageNumber);

        if (_viewMode) {
            window.iframeWindow.PDFAnnotate.UI.disableViewMode();
            window.iframeWindow.PDFAnnotate.UI.enableViewMode();
        }
    });
}

/**
    The entry point.
*/
window.addEventListener('DOMContentLoaded', e => {
    startApplication();
});
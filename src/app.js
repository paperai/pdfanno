require("file?name=dist/index.html!./index.html");
require("!style!css!./app.css");

/**
    Adjust the height of viewer according to window height.
*/
function adjustViewerSize() {

    function resizeHandler() {
        let height = $(window).innerHeight() - $('#viewer').offset().top;
        $('#viewer iframe').css('height', `${height}px`);
    }

    window.addEventListener('resize', resizeHandler);
    resizeHandler();
}

/**
    Disable annotation tool buttons.
*/
function disableAnnotateTools() {
    window.iframeWindow.PDFAnnotate.UI.disableRect('area');
    window.iframeWindow.PDFAnnotate.UI.disableRect('highlight');
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
            window.iframeWindow.PDFAnnotate.UI.enableRect('highlight');
        
        } else if (type === 'arrow') {
            window.iframeWindow.PDFAnnotate.UI.enableArrow('one-way');
        
        } else if (type === 'arrow-two-way') {
            window.iframeWindow.PDFAnnotate.UI.enableArrow('two-way');

        } else if (type === 'rect') {
            window.iframeWindow.PDFAnnotate.UI.enableRect('area');
        
        } else if (type === 'text') {
            window.iframeWindow.PDFAnnotate.UI.enableText();
        
        } else if (type === 'download') {
            window.iframeWindow.PDFAnnotate.UI.enableViewMode();
            downloadAnnotation();
        
        } else if (type === 'delete') {
            window.iframeWindow.PDFAnnotate.UI.enableViewMode();
            deleteAnnotation();            
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
            deleteAnnotation();            
        }

        return false;
    });


    $('.js-tool-btn[data-type="view"]').click();
}

function downloadAnnotation() {

    window.iframeWindow.PDFAnnotate.getStoreAdapter().exportData().then(annotations => {
        console.log('annotations:', annotations);
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

function deleteAnnotation() {
    let documentId = window.iframeWindow.getFileName(window.iframeWindow.PDFView.url);
    window.iframeWindow.PDFAnnotate.getStoreAdapter().deleteAnnotations(documentId).then(() => {
        
        // Reload pdf.js.
        $('#viewer iframe').remove();
        $('#viewer').html('<iframe src="../pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');

        // Re-setup.
        start('second');
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

    $('#paper').on('change', e => {
        
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
    $('#primary-anno').on('change', e => {

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
    $('#secondary-anno').on('change', e => {

        let files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        _secondaryAnnotations = [];

        Array.prototype.forEach.call(files, file => {
            let fileReader = new FileReader();
            fileReader.onload = event => {
                _secondaryAnnotations.push(event.target.result);
            }
            fileReader.readAsText(file);
        });
    });
}

function setupLoadButton() {
    $('#load').on('click', e => {
        // TODO セカンダリーの対応.

        // Check required.
        if (!_paperName) {
            return alert('Please specify your PDF file.');
        }
        if (!_primaryAnnotation) {
            return alert('Please specify your primary annotation file.');
        }

        // Set data.
        localStorage.setItem('_pdfanno_pdfname', _paperName);
        localStorage.setItem('_pdfanno_pdf', _paperData);
        localStorage.setItem('_pdfanno_pdfanno_upload', _primaryAnnotation);

        // Reload pdf.js.
        $('#viewer iframe').remove();
        $('#viewer').html('<iframe src="../pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');

        // Re-setup.
        start('second');
    });
}

function start(execMode='first') {

    // Alias for convenience.
    window.iframeWindow = $('#viewer iframe').get(0).contentWindow;

    iframeWindow.addEventListener('DOMContentLoaded', () => {

        // Adjust the height of viewer.
        adjustViewerSize();

        if (execMode === 'first') {
            // Initialize tool buttons' behavior.
            initializeAnnoToolButtons();

            // Set the behaviors of file inputs.
            initializeFileUploader();            
        }
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
    start();
});
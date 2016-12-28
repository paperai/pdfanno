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

function reloadPDFViewer() {

    // Reload pdf.js.
    $('#viewer iframe').remove();
    $('#viewer').html('<iframe src="./pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');

    // Restart.
    startApplication();
}

/**
 * Delete all annotations.
 */
function deleteAllAnnotations() {
    let documentId = window.iframeWindow.getFileName(window.iframeWindow.PDFView.url);
    window.iframeWindow.PDFAnnotate.getStoreAdapter().deleteAnnotations(documentId).then(() => {

        reloadPDFViewer();        
    });
}

/**
    Set the behaviors of file inputs.
*/
let _primaryAnnotation = null;
let _secondaryAnnotations = [];
function initializeFileUploader() {
    setupPrimaryAnnotationButton();
    setupSecondaryAnnotationButton();
    setupLoadButton();
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
        _primaryAnnotation && localStorage.setItem('_pdfanno_pdfanno_upload', _primaryAnnotation);
        _secondaryAnnotations && localStorage.setItem('_pdfanno_pdfanno_upload_second', JSON.stringify(_secondaryAnnotations));

        // Reload pdf.js.
        $('#viewer iframe').remove();
        $('#viewer').html('<iframe src="./pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');

        // Re-setup.
        startApplication();
    });
}

// ref: https://github.com/pdfanno/pdfanno/blob/3b8eba716a416ffa3d03edd79352859b4dd9f9e0/src/bk/viewer2js/viewer2.js

function setupPDFDragAndDropLoader() {

    console.log('setupPDFDragAndDropLoader');

    let element = document.querySelector('.js-viewer-root');

    element.removeEventListener('dragenter', handleDragEnter);
    element.removeEventListener('dragleave', handleDragLeave);
    element.removeEventListener('dragover', handleDragOver);
    element.removeEventListener('drop', handleDroppedFile);
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDroppedFile);
}

function checkFileCompatibility(fileName, ext) {
    let fragments = fileName.split('.');
    if (fragments.length < 2) {
        return false;
    }
    return fragments[1].toLowerCase() === ext;
}

function handleDroppedFile(e) {

    console.log('handleDroppedFile');

    let element = e.target;
    let file = e.dataTransfer.files[0];
    console.log('file:', file);

    $('#viewer').removeClass('-active');

    let fileName = file.name;

    // Check compatibility.
    if (!checkFileCompatibility(fileName, 'pdf')) {
        alert(`FILE NOT COMPATIBLE. "*.pdf" can be loaded.\n actual = "${fileName}".`);
        return cancelEvent(e);
    }

    let fileReader = new FileReader();
    fileReader.onload = event => {
        let data = event.target.result;
        localStorage.setItem('_pdfanno_pdf', data);
        localStorage.setItem('_pdfanno_pdfname', fileName);

        reloadPDFViewer();
    }
    fileReader.readAsDataURL(file);

    return cancelEvent(e);
}

function handleDragEnter(e) {
    console.log('handleDragEnter');
    $('#viewer').addClass('-active');
    return cancelEvent(e);
}

function handleDragLeave(e) {
    console.log('handleDragLeave');
    $('#viewer').removeClass('-active');
    return cancelEvent(e);
}

let timer = null;
function handleDragOver(e) {
    console.log('handleDragOver');

    $('#viewer').addClass('-active');

    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        $('#viewer').removeClass('-active');
        timer = null;
    }, 1000);

    return cancelEvent(e);
}

// Cancel handler
function cancelEvent(e) {
    e.preventDefault();
    return false;
}

/**
 * Setup the UI for loading and selecting annotations.
 */
function setupAnnotationSelectUI() {

    // Setup colorPickers.
    $('.js-anno-palette').spectrum({
        showPaletteOnly        : true,
        showPalette            : true,
        hideAfterPaletteSelect : true,
        palette                : [
            ['black', 'white', 'blanchedalmond', 'rgb(255, 128, 0)', 'hsv 100 70 50'],
            ['red', 'yellow', 'green', 'blue', 'violet']
        ]
    });
    // Set initial color.
    $('.js-anno-palette').eq(0).spectrum('set', 'red');
    $('.js-anno-palette').eq(1).spectrum('set', 'green');
    $('.js-anno-palette').eq(2).spectrum('set', 'blue');
    $('.js-anno-palette').eq(3).spectrum('set', 'violet');

    // Setup behavior.
    $('.js-anno-radio, .js-anno-palette, .js-anno-file').on('change', displayAnnotation);
}

/**
 * Load annotation data and display.
 */
function displayAnnotation() {
    console.log('displayAnnotation');

    // Primary annotation index.
    let primaryIndex = parseInt($('.js-anno-radio:checked').val(), 10);
    console.log(primaryIndex);
    
    // Annotation color.
    let color1 = $('.js-anno-palette').eq(0).spectrum('get').toHex();
    let color2 = $('.js-anno-palette').eq(1).spectrum('get').toHex();
    let color3 = $('.js-anno-palette').eq(2).spectrum('get').toHex();
    let color4 = $('.js-anno-palette').eq(3).spectrum('get').toHex();
    console.log(color1, color2, color3, color4);

    // Annotation files.
    let actions = [];
    $('.js-anno-file').each(function() {
        let files = this.files;

        actions.push(new Promise((resolve, reject) => {

            if (files.length === 0) {
                return resolve(null);
            }

            let fileReader = new FileReader();
            fileReader.onload = event => {
                let annotation = event.target.result;
                // TODO JSON scheme check.
                resolve(JSON.parse(annotation));
            }
            fileReader.readAsText(files[0]);
        }));
    });
    Promise.all(actions).then((annotations) => {
        console.log(annotations);

        let isZero = (annotations.filter(a => a !== null).length === 0);
        if (isZero) {
            console.log('isZero');
            return;
        }
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

        // Set the event drag & drop for loading a PDF file.
        setupPDFDragAndDropLoader();    
    });

    iframeWindow.addEventListener('annotationrendered', (ev) => {
        console.log('annotationrendered', ev.detail.pageNumber);

        if (_viewMode) {
            window.iframeWindow.PDFAnnotate.UI.disableViewMode();
            window.iframeWindow.PDFAnnotate.UI.enableViewMode();
        }
    });

    iframeWindow.addEventListener('pdfdropped', (ev) => {
        console.log('pdfdropped', ev.detail.originalEvent.dataTransfer.files[0]);
        handleDroppedFile(ev.detail.originalEvent);
    });

    iframeWindow.addEventListener('pdfdragover', (ev) => {
        console.log('pdfdragover!!!');
        handleDragOver(ev.detail.originalEvent);
    });

    // Setup the annotation load and select UI.
    setupAnnotationSelectUI();
}

/**
    The entry point.
*/
window.addEventListener('DOMContentLoaded', e => {
    startApplication();
});
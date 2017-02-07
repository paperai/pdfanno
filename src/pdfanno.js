require("file?name=dist/index.html!./index.html");
require("!style!css!./pdfanno.css");

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
    window.iframeWindow.PDFAnnoCore.UI.disableRect();
    window.iframeWindow.PDFAnnoCore.UI.disableHighlight();
    window.iframeWindow.PDFAnnoCore.UI.disableArrow();
    window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
}

/**
    Set the behavior of the tool buttons for annotations.
*/
function initializeAnnoToolButtons() {

    $('.js-tool-btn').off('click').on('click', (e) => {

        let $button = $(e.currentTarget);
        let type = $button.data('type');

        $('.js-tool-btn').removeClass('active');
        $button.addClass('active');

        disableAnnotateTools();

        if (type === 'view') {
            window.iframeWindow.PDFAnnoCore.UI.enableViewMode();

        } else if (type === 'highlight') {
            window.iframeWindow.PDFAnnoCore.UI.enableHighlight();

        } else if (type === 'arrow') {
            window.iframeWindow.PDFAnnoCore.UI.enableArrow('one-way');

        } else if (type === 'arrow-two-way') {
            window.iframeWindow.PDFAnnoCore.UI.enableArrow('two-way');

        } else if (type === 'link') {
            window.iframeWindow.PDFAnnoCore.UI.enableArrow('link');

        } else if (type === 'rect') {
            window.iframeWindow.PDFAnnoCore.UI.enableRect();

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

/**
 * Export the primary annotation data for download.
 */
function downloadAnnotation() {

    window.iframeWindow.PDFAnnoCore.getStoreAdapter().exportData().then(annotations => {
        annotations = JSON.stringify(annotations, null, '\t');
        let blob = new Blob([annotations]);
        let blobURL = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        document.body.appendChild(a); // for firefox working correctly.
        let fileName = iframeWindow.getFileName(iframeWindow.PDFView.url);
        fileName = fileName.split('.')[0] + '.anno';
        a.download = fileName;
        a.href = blobURL;
        a.click();
        a.parentNode.removeChild(a);
    });

    unlistenWindowLeaveEvent();
}

/**
 * Reload PDF Viewer.
 */
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

    // Comfirm to user.
    let userAnswer = window.confirm('Are you sure to clear the current annotations?');
    if (!userAnswer) {
        return;
    }

    let documentId = window.iframeWindow.getFileName(window.iframeWindow.PDFView.url);
    window.iframeWindow.PDFAnnoCore.getStoreAdapter().deleteAnnotations(documentId).then(() => {
        reloadPDFViewer();
    });
}

/**
 * Check the filename which user dropped in.
 */
function checkFileCompatibility(fileName, ext) {
    let fragments = fileName.split('.');
    if (fragments.length < 2) {
        return false;
    }
    return fragments[1].toLowerCase() === ext;
}

/**
 * Load user's pdf file.
 */
function handleDroppedFile(file) {

    // Confirm dialog.
    let userAnswer = window.confirm('Are you sure to load a new pdf file? Please save your current annotations.');
    if (!userAnswer) {
        return;
    }

    let fileName = file.name;

    // Check compatibility.
    if (!checkFileCompatibility(fileName, 'pdf')) {
        return alert(`FILE NOT COMPATIBLE. "*.pdf" can be loaded.\n actual = "${fileName}".`);
    }

    // Load pdf data, and reload.
    let fileReader = new FileReader();
    fileReader.onload = event => {
        let data = event.target.result;
        localStorage.setItem('_pdfanno_pdf', data);
        localStorage.setItem('_pdfanno_pdfname', fileName);

        reloadPDFViewer();
    }
    fileReader.readAsDataURL(file);
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
            ['blanchedalmond', 'rgb(255, 128, 0)', 'hsv 100 70 50', 'yellow'],
            ['red', 'green', 'blue', 'violet']
        ]
    });
    // Set initial color.
    $('.js-anno-palette').eq(0).spectrum('set', 'red');
    $('.js-anno-palette').eq(1).spectrum('set', 'green');
    $('.js-anno-palette').eq(2).spectrum('set', 'blue');
    $('.js-anno-palette').eq(3).spectrum('set', 'violet');

    // Setup behavior.
    $('.js-anno-radio, .js-anno-visibility, .js-anno-palette, .js-anno-file').on('change', displayAnnotation);
}

/**
 * The data which has annotations, colors, primaryIndex.
 */
let paperData = null;

/**
 * Load annotation data and display.
 */
function displayAnnotation(e) {

    let updateTarget = $(e.target).attr('name');

    // Get the primary index which indicates the editable annotation.
    let primaryIndex = parseInt($('.js-anno-radio:checked').val(), 10);

    // Get annotation visibilities.
    let visibilities = [
        $('.js-anno-visibility').eq(0).is(':checked'),
        $('.js-anno-visibility').eq(1).is(':checked'),
        $('.js-anno-visibility').eq(2).is(':checked'),
        $('.js-anno-visibility').eq(3).is(':checked'),
    ];

    // Get annotation colors.
    let colors = [
        $('.js-anno-palette').eq(0).spectrum('get').toHexString(),
        $('.js-anno-palette').eq(1).spectrum('get').toHexString(),
        $('.js-anno-palette').eq(2).spectrum('get').toHexString(),
        $('.js-anno-palette').eq(3).spectrum('get').toHexString()
    ];

    // Get annotation data.
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
                // TODO JSON scheme check ?
                resolve(JSON.parse(annotation));
            }
            fileReader.readAsText(files[0]);
        }));
    });
    Promise.all(actions).then((annotations) => {

        annotations = annotations.map(a => {
            return a ? a : {};
        });

        // Create import data.
        paperData = {
            num     : 4,
            primary : primaryIndex,
            visibilities,
            colors,
            annotations,
            updateTarget
        };

        // Pass the data to pdf-annotatejs.
        window.iframeWindow.PDFAnnoCore.getStoreAdapter().importAnnotations(paperData).then(result => {

            // Reload the viewer.
            reloadPDFViewer();

            // Reset tools to viewMode.
            $('.js-tool-btn[data-type="view"]').click();
        });
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
        initializeAnnoToolButtons();

        // Reset the confirm dialog at leaving page.
        unlistenWindowLeaveEvent();
    });

    // Set viewMode behavior after annotations rendered.
    iframeWindow.addEventListener('annotationrendered', () => {
        window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
        window.iframeWindow.PDFAnnoCore.UI.enableViewMode();
    });

    // Handle the pdf user dropped in.
    iframeWindow.addEventListener('pdfdropped', ev => {
        handleDroppedFile(ev.detail.file);
    });

    // Set the confirm dialog at page leaving.
    iframeWindow.addEventListener('annotationUpdated', listenWindowLeaveEvent);
}

/**
    The entry point.
*/
window.addEventListener('DOMContentLoaded', e => {

    // Delete prev annotations.
    if (location.search.indexOf('debug') === -1) {
        const LOCALSTORAGE_KEY2 = '_pdfanno_containers';
        localStorage.removeItem(LOCALSTORAGE_KEY2);
    }

    // Start application.
    startApplication();

    // Setup the annotation load and select UI.
    setupAnnotationSelectUI();
});

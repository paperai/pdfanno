require("file?name=dist/index.html!./index.html");
require("!style!css!./pdfanno.css");

/**
 * The data which is loaded via `Browse` button.
 */
let fileMap = {};

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

    iframeWindow.annotationContainer.destroy();

    let documentId = window.iframeWindow.getFileName(window.iframeWindow.PDFView.url);
    window.iframeWindow.PDFAnnoCore.getStoreAdapter().deleteAnnotations(documentId).then(() => {
        reloadPDFViewer();
    });
}

/**
 * Setup the color pickers.
 */
function setupColorPicker() {

    const colors = [
        'rgb(255, 128, 0)', 'hsv 100 70 50', 'yellow', 'blanchedalmond',
        'red', 'green', 'blue', 'violet'
    ];

    // Setup colorPickers.
    $('.js-anno-palette').spectrum({
        showPaletteOnly        : true,
        showPalette            : true,
        hideAfterPaletteSelect : true,
        palette                : [
            colors.slice(0, Math.floor(colors.length/2)),
            colors.slice(Math.floor(colors.length/2), colors.length)
        ]
    });
    // Set initial color.
    $('.js-anno-palette').each((i, elm) => {
        $(elm).spectrum('set', colors[ i % colors.length ]);
    });

    // Setup behavior.
    $('.js-anno-palette').off('change').on('change', displayAnnotation.bind(null, false));
}

/**
 * Load annotation data and display.
 */
function displayAnnotation(isPrimary) {

    let annotations = [];
    let colors = [];
    let primaryIndex = -1;

    // Primary annotation.
    if (isPrimary) {
        $('#dropdownAnnoPrimary a').each((index, element) => {
            let $elm = $(element);
            if ($elm.find('.fa-check').hasClass('no-visible') === false) {
                let annoPath = $elm.find('.js-annoname').text();
                if (!fileMap[annoPath]) {
                    console.log('ERROR');
                    return;
                }
                primaryIndex = 0;
                annotations.push(fileMap[annoPath]);
                let color = null; // Use the default color used for edit.
                colors.push(color);

                let filename = annoPath.split('/')[annoPath.split('/').length - 1];
                localStorage.setItem('_pdfanno_primary_annoname', filename);
                console.log('filename:', filename);
            }
        });
    }

    // Reference annotations.
    if (!isPrimary) {
        $('#dropdownAnnoReference a').each((index, element) => {
            let $elm = $(element);
            if ($elm.find('.fa-check').hasClass('no-visible') === false) {
                let annoPath = $elm.find('.js-annoname').text();
                if (!fileMap[annoPath]) {
                    console.log('ERROR');
                    return;
                }
                annotations.push(fileMap[annoPath]);
                let color = $elm.find('.js-anno-palette').spectrum('get').toHexString();
                console.log(color);
                colors.push(color);
            }
        });
    }

    console.log('colors:', colors);

    // Create import data.
    let paperData = {
        primary : primaryIndex,
        colors,
        annotations
    };

    // Pass the data to pdf-annotatejs.
    window.iframeWindow.PDFAnnoCore.getStoreAdapter().importAnnotations(paperData, isPrimary).then(result => {

        // Reload the viewer.
        reloadPDFViewer();

        // Reset tools to viewMode.
        $('.js-tool-btn[data-type="view"]').click();
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
 * Clear the dropdowns of annotations.
 */
function clearAnnotationDropdowns() {
    $('#dropdownAnnoPrimary ul').html('');
    $('#dropdownAnnoReference ul').html('');
    $('#dropdownAnnoPrimary .js-text').text('Select Anno file');
    $('#dropdownAnnoReference .js-text').text('Select reference Anno files');
}

function _excludeBaseDirName(filePath) {
    let frgms = filePath.split('/');
    return frgms[frgms.length - 1];
}

/**
 * Clear the dropdown of a PDF file.
 */
function setupBrowseButton() {

    $('.js-file :file').on('change', ev => {

        console.log('Browse button starts to work.');

        let files = ev.target.files;
        if (!files || files.length === 0) {
            console.log('ev.target.files', ev.target.files);
            console.log('Not files specified');
            return;
        }

        let pdfs = [];
        let annos = [];

        for (let i = 0; i < files.length; i++) {

            let file = ev.target.files[i];
            let relativePath = file.webkitRelativePath;
            if (!relativePath) {
                alert('Please select a directory, NOT a file');
                return;
            }

            let frgms = relativePath.split('/');
            if (frgms.length > 2) {
                console.log('SKIP:', relativePath);
                continue;
            }
            console.log('relativePath:', relativePath);

            // Get files only PDFs or Anno files.
            if (relativePath.match(/\.pdf$/i)) {
                pdfs.push(file);
            } else if (relativePath.match(/\.anno$/i)) {
                annos.push(file);
            }
        }

        // pdf.
        $('#dropdownPdf .js-text').text('Select PDF file');
        $('#dropdownPdf li').remove();
        pdfs.forEach(file => {
            let pdfPath = _excludeBaseDirName(file.webkitRelativePath);
            let snipet = `
                <li>
                    <a href="#">
                        <i class="fa fa-check no-visible" aria-hidden="true"></i>&nbsp;
                        <span class="js-pdfname">${pdfPath}</span>
                    </a>
                </li>
            `;
            $('#dropdownPdf ul').append(snipet);
        });

        // Clear anno dropdowns.
        clearAnnotationDropdowns();

        // Initialize PDF Viewer.
        clearAllAnnotations();
        localStorage.removeItem('_pdfanno_pdf');
        localStorage.removeItem('_pdfanno_pdfname');
        reloadPDFViewer();

        fileMap = {};

        // Load pdfs.
        pdfs.forEach(file => {
            let fileReader = new FileReader();
            fileReader.onload = event => {
                let pdf = event.target.result;
                let fileName = _excludeBaseDirName(file.webkitRelativePath);
                fileMap[fileName] = pdf;
            }
            fileReader.readAsDataURL(file);
        });

        // Load annos.
        annos.forEach(file => {
            let fileReader = new FileReader();
            fileReader.onload = event => {
                let annotation = event.target.result;
                let fileName = _excludeBaseDirName(file.webkitRelativePath);
                fileMap[fileName] = annotation;
            }
            fileReader.readAsText(file);
        });

    });

}

/**
 * Setup the dropdown of PDFs.
 */
function setupPdfDropdown() {

    $('#dropdownPdf').on('click', 'a', e => {

        let $this = $(e.currentTarget);
        let pdfPath = $this.find('.js-pdfname').text();

        let currentPDFName = $('#dropdownPdf .js-text').text();
        if (currentPDFName === pdfPath) {
            console.log('Not reload. the pdf are same.');
            return;
        }

        // Confirm to override.
        if (currentPDFName !== 'Select PDF file') {
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

        // reload.
        window.pdf = fileMap[pdfPath];
        let fileName = pdfPath.split('/')[pdfPath.split('/').length - 1];
        window.pdfName = fileName;

        reloadPDFViewer();

        // Clear anno dropdowns.
        clearAnnotationDropdowns();

        // Clear the all annotations.
        clearAllAnnotations();

        // Setup anno dropdown.
        let pdfName = pdfPath.replace(/\.pdf$/i, '');
        Object.keys(fileMap).forEach(filePath => {

            if (!filePath.match(/\.anno$/i)) {
                return;
            }

            if (filePath.indexOf(pdfName) === 0) {

                let snipet1 = `
                    <li>
                        <a href="#">
                            <i class="fa fa-check no-visible" aria-hidden="true"></i>
                            <span class="js-annoname">${filePath}</span>
                        </a>
                    </li>
                `;
                $('#dropdownAnnoPrimary ul').append(snipet1);

                let snipet2 = `
                    <li>
                        <a href="#">
                            <i class="fa fa-check no-visible" aria-hidden="true"></i>
                            <input type="text"  name="color" class="js-anno-palette"  autocomplete="off">
                            <span class="js-annoname">${filePath}</span>
                        </a>
                    </li>
                `;
                $('#dropdownAnnoReference ul').append(snipet2);
            }
        });

        // Setup color pallets.
        setupColorPicker();

        // Close dropdown.
        $('#dropdownPdf').click();

        return false;
    });
}

/**
 * Setup the dropdown of a primary annotation.
 */
function setupPrimaryAnnoDropdown() {

    $('#dropdownAnnoPrimary').on('click', 'a', e => {

        let $this = $(e.currentTarget);
        let annoName = $this.find('.js-annoname').text();

        let currentAnnoName = $('#dropdownAnnoPrimary .js-text').text();
        if (currentAnnoName === annoName) {
            console.log('Not reload. the anno are same.');
            return;
        }

        // Confirm to override.
        if (currentAnnoName !== 'Select Anno file') {
            if (!window.confirm('Are you sure to load another Primary Annotation ?')) {
                return;
            }
        }


        $('#dropdownAnnoPrimary .js-text').text(annoName);
        console.log(annoName);

        $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
        $this.find('.fa-check').removeClass('no-visible');

        if (!fileMap[annoName]) {
            return false;
        }

        // reload.
        displayAnnotation(true);

        // Close
        $('#dropdownAnnoPrimary').click();

        return false;
    });
}

/**
 * Setup the dropdown of reference annotations.
 */
function setupReferenceAnnoDropdown() {

    $('#dropdownAnnoReference').on('click', 'a', e => {

        let $this = $(e.currentTarget);

        $this.find('.fa-check').toggleClass('no-visible');

        let annoNames = [];
        $('#dropdownAnnoReference a').each((index, element) => {
            let $elm = $(element);
            if ($elm.find('.fa-check').hasClass('no-visible') === false) {
                annoNames.push($elm.find('.js-annoname').text());
            }
        });
        if (annoNames.length > 0) {
            $('#dropdownAnnoReference .js-text').text(annoNames.join(','));
        } else {
            $('#dropdownAnnoReference .js-text').text('Select reference Anno files');
        }

        displayAnnotation(false);

        return false;

    });
}

/**
 * Clear the all annotations from the view and storage.
 */
function clearAllAnnotations() {
    localStorage.removeItem('_pdfanno_containers');
    localStorage.removeItem('_pdfanno_primary_annoname');
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

    // Set the confirm dialog at page leaving.
    iframeWindow.addEventListener('annotationUpdated', listenWindowLeaveEvent);
}

/**
 *  The entry point.
 */
window.addEventListener('DOMContentLoaded', e => {

    // Delete prev annotations.
    if (location.search.indexOf('debug') === -1) {
        clearAllAnnotations();
    }

    // Start application.
    startApplication();

    // Setup loading tools for PDFs and Anno files.
    setupBrowseButton();
    setupPdfDropdown();
    setupPrimaryAnnoDropdown();
    setupReferenceAnnoDropdown();

});

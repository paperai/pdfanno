

/**
 * Display annotations an user selected.
 */
export function displayAnnotation(isPrimary, reload=true) {

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

        if (reload) {
            // Reload the viewer.
            reloadPDFViewer();
        }

        return true;
    });

}

/**
 * Reload PDF Viewer.
 */
export function reloadPDFViewer() {

    // Reload pdf.js.
    $('#viewer iframe').remove();
    $('#viewer').html('<iframe src="./pages/viewer.html" class="anno-viewer" frameborder="0"></iframe>');

    // Restart.
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('restartApp', true, true, null);
    window.dispatchEvent(event);

    // Catch the event iframe is ready.
    function iframeReady() {
        console.log('iframeReady');
        window.removeEventListener('annotationrendered', iframeReady);
    }
    window.addEventListener('annotationrendered', iframeReady);
}

/**
 * Setup the color pickers.
 */
export function setupColorPicker() {

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




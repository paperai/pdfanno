/**
 * UI parts - Browse button.
 */
import { reloadPDFViewer, setupColorPicker, displayAnnotation } from '../util/display';
import { enableAnnotateTool, disableAnnotateTools, clearAllAnnotations } from '../util/anno';

// import { loadFiles } from '../pdf';
import AnnoPage from '../pdf';

/**
 * Setup the behavior of a Browse Button.
 */
export function setup() {

    // Enable to select the same directory twice or more.
    $('.js-file :file').on('click', ev => {
        $('input[type="file"]').val(null);
    });

    $('.js-file :file').on('change', ev => {

        const files = ev.target.files;

        let error = isValidDirectorySelect(files);
        if (error) {
            return alert(error);
        }

        window.annoPage.loadFiles(files).then(() => {

            console.log('finish!!!');
        });


        // // Load PDF/Anno files, and initialize dropdown lists.
        // AnnoPage.loadFiles(files).then((pdfNames, annoNames, pdfDataMap, annoDataMap) => {

        //     console.log('loadFiles:', pdfNames, annoNames, pdfDataMap, annoDataMap);

        //     // Get current visuals.
        //     const current = getCurrentFileNames();

        //     // Initialize PDF Viewer.
        //     clearAllAnnotations();

        //     // Setup PDF Dropdown.
        //     setPDFDropdownList(1);

        //     // Setup Anno Dropdown.
        //     setAnnoDropdownList(annoNames);

        //     // Display a PDF and annotations.
        //     display(current, pdfDataMap, annoDataMap);
        // });
    });
}

/**
 * Check whether the directory the user specified is valid.
 */
function isValidDirectorySelect(files) {

    // Error, if no contents exits.
    if (!files || files.length === 0) {
        return 'Not files specified';
    }

    // Error, if the user select a file - not a directory.
    let relativePath = files[0].webkitRelativePath;
    if (!relativePath) {
        return 'Please select a directory, NOT a file';
    }

    // OK.
    return null;
}



function display(currentDisplay, pdfDataMap, annoDataMap) {

    console.log('files:', Object.keys(pdfDataMap));
    console.log('files2:', Object.keys(annoDataMap));

    let name;

    // PDF.
    name = currentDisplay.pdfName;
    if (name && newFileMap[name]) {
        window.pdf = window.pdfanno.fileMap[name];
        window.pdfName = currentDisplay.pdfName;

        $('#dropdownPdf .js-text').text(name);
        $('#dropdownPdf a').each((index, element) => {
            let $elm = $(element);
            if ($elm.find('.js-pdfname').text() === name) {
                $elm.find('.fa-check').removeClass('no-visible');
            }
        });

    } else {
        delete window.pdf;
        delete window.pdfName;
    }

    // Primary Annotation.
    name = currentDisplay.primaryAnnotationName;
    let promise1 = Promise.resolve();
    if (name && newFileMap[name]) {

        $('#dropdownAnnoPrimary .js-text').text(name);
        $('#dropdownAnnoPrimary a').each((index, element) => {
            let $elm = $(element);
            if ($elm.find('.js-annoname').text() === name) {
                $elm.find('.fa-check').removeClass('no-visible');
            }
        });

        promise1 = displayAnnotation(true, false);
    }

    // Reference Annotations.
    let names = currentDisplay.referenceAnnotationNames;
    let colors = currentDisplay.referenceAnnotationColors;
    let changed = false;
    names = names.filter((name, i) => {
        let found = false;
        if (newFileMap[name]) {
            $('#dropdownAnnoReference a').each((index, element) => {
                let $elm = $(element);
                if ($elm.find('.js-annoname').text() === name) {
                    $elm.find('.fa-check').removeClass('no-visible');
                    $elm.find('.js-anno-palette').spectrum('set', colors[i]);

                    console.log('color: ', colors[i]);

                    found = true;
                }
            });
        }
        return found;
    });
    let promise2 = Promise.resolve();
    if (names.length > 0) {
        $('#dropdownAnnoReference .js-text').text(names.join(','));
        promise2 = displayAnnotation(false, false);
    }

    // Reload page.
    Promise.all([promise1, promise2]).then(reloadPDFViewer);

}

/**
 * Get a filename from a path.
 */
function _excludeBaseDirName(filePath) {
    let frgms = filePath.split('/');
    return frgms[frgms.length - 1];
}

/**
 * Get the file names which currently are displayed.
 */
function getCurrentFileNames() {

    let text;

    // a PDF name.
    text = $('#dropdownPdf .js-text').text();
    let pdfName = (text !== 'PDF File' ? text : null);

    // a Primary anno.
    text = $('#dropdownAnnoPrimary .js-text').text();
    let primaryAnnotationName = (text !== 'Anno File' ? text : null);


    let referenceAnnotationNames = [];
    let referenceAnnotationColors = [];
    $('#dropdownAnnoReference a').each((index, element) => {
        let $elm = $(element);
        if ($elm.find('.fa-check').hasClass('no-visible') === false) {
            let annoName = $elm.find('.js-annoname').text(); // TODO こういうのはJS変数として持っておいたほうがいいかも（選択済のものについて）
            referenceAnnotationNames.push(annoName);
            let color = $elm.find('.js-anno-palette').spectrum('get').toHexString();
            referenceAnnotationColors.push(color);
        }
    });

    return {
        pdfName,
        primaryAnnotationName,
        referenceAnnotationNames,
        referenceAnnotationColors
    };
}

/**
 * Setup the contents of the dropdown for PDFs.
 */
function setPDFDropdownList(pdfs=[]) {

    console.log('pdfs:', pdfs);

    $('#dropdownPdf .js-text').text('PDF File');
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
}

/**
 * Setup the contents of the dropdowns for primary/reference annotations.
 */
function setAnnoDropdownList(annos=[]) {

    // Reset.
    $('#dropdownAnnoPrimary ul').html('');
    $('#dropdownAnnoReference ul').html('');
    $('#dropdownAnnoPrimary .js-text').text('Anno File');
    $('#dropdownAnnoReference .js-text').text('Reference Files');

    // Setup anno / reference dropdown.
    annos.forEach(file => {

        let fileName = _excludeBaseDirName(file.webkitRelativePath);

        let snipet1 = `
            <li>
                <a href="#">
                    <i class="fa fa-check no-visible" aria-hidden="true"></i>
                    <span class="js-annoname">${fileName}</span>
                </a>
            </li>
        `;
        $('#dropdownAnnoPrimary ul').append(snipet1);

        let snipet2 = `
            <li>
                <a href="#">
                    <i class="fa fa-check no-visible" aria-hidden="true"></i>
                    <input type="text" name="color" class="js-anno-palette" autocomplete="off">
                    <span class="js-annoname">${fileName}</span>
                </a>
            </li>
        `;
        $('#dropdownAnnoReference ul').append(snipet2);
    });

    // Setup color pallets.
    setupColorPicker();
}

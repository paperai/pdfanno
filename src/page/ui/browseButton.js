/**
 * UI parts - Browse button.
 */
import { reloadPDFViewer, clearAllAnnotations, setupColorPicker } from '../util/display';



/**
 * Setup the behavior of a Browse Button.
 */
export function setup() {

    // Enable to select the same directory twice.
    $('.js-file :file').on('click', ev => {
        $('input[type="file"]').val(null);
    });

    $('.js-file :file').on('change', ev => {

        const files = ev.target.files;

        let error = isValidDirectorySelect(files);
        if (error) {
            return alert(error);
        }

        // Get current visuals.
        const current = getCurrentFileNames();

        // Get contents.
        const { pdfs, annos } = getContents(files);

        // Setup PDF Dropdown.
        setPDFDropdownList(pdfs);

        // Setup Anno Dropdown.
        setAnnoDropdownList(annos);

        // Initialize PDF Viewer.
        clearAllAnnotations();
        localStorage.removeItem('_pdfanno_pdf');
        localStorage.removeItem('_pdfanno_pdfname');
        reloadPDFViewer();

        // Load data.
        loadData(pdfs, annos).then(() => {
            console.log('completed!!!!!!!!!!!!');

            // TODO 前の状況を復元する処理を書く.



        });

    });

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
    let pdfName = (text !== 'Select PDF file' ? text : null);

    // a Primary anno.
    text = $('#dropdownAnnoPrimary .js-text').text();
    let primaryAnno = (text !== 'Select Anno file' ? text : null);

    // Reference annos.
    text = $('#dropdownAnnoReference .js-text').text();
    let referenceAnnos = (text !== 'Select reference Anno files' ? text.split(',') : []);

    return {
        pdfName,
        primaryAnno,
        referenceAnnos
    };
}


function isValidDirectorySelect(files) {

    if (!files || files.length === 0) {
        return 'Not files specified';
    }

    let relativePath = files[0].webkitRelativePath;
    if (!relativePath) {
        return 'Please select a directory, NOT a file';
    }

    // OK.
    return null;
}

function getContents(files) {
    let pdfs = [];
    let annos = [];

    for (let i = 0; i < files.length; i++) {

        let file = files[i];
        let relativePath = file.webkitRelativePath;

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

    return {
        pdfs,
        annos
    };
}

function setPDFDropdownList(pdfs) {

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
}

function setAnnoDropdownList(annos) {

    // Reset.
    $('#dropdownAnnoPrimary ul').html('');
    $('#dropdownAnnoReference ul').html('');
    $('#dropdownAnnoPrimary .js-text').text('Select Anno file');
    $('#dropdownAnnoReference .js-text').text('Select reference Anno files');

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
                    <input type="text"  name="color" class="js-anno-palette"  autocomplete="off">
                    <span class="js-annoname">${fileName}</span>
                </a>
            </li>
        `;
        $('#dropdownAnnoReference ul').append(snipet2);
    });

    // Setup color pallets.
    setupColorPicker();
}

function loadData(pdfs, annos) {

    window.fileMap = {};

    return new Promise((resolve, reject) => {

        let promises = [];

        // Load pdfs.
        let p = pdfs.map(file => {
            return new Promise((resolve, reject) => {
                let fileReader = new FileReader();
                fileReader.onload = event => {
                    let pdf = event.target.result;
                    let fileName = _excludeBaseDirName(file.webkitRelativePath);
                    fileMap[fileName] = pdf;
                    resolve();
                }
                fileReader.readAsDataURL(file);
            });
        });
        promises = promises.concat(p);

        // Load annos.
        p = annos.map(file => {
            return new Promise((resolve, reject) => {
                let fileReader = new FileReader();
                fileReader.onload = event => {
                    let annotation = event.target.result;
                    let fileName = _excludeBaseDirName(file.webkitRelativePath);
                    fileMap[fileName] = annotation;
                    resolve();
                }
                fileReader.readAsText(file);
            });
        });
        promises = promises.concat(p);

        // Wait for complete.
        Promise.all(promises).then(resolve);

    });

}

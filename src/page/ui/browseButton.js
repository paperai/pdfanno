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

        console.log('Browse button starts to work.');

        let files = ev.target.files;
        if (!files || files.length === 0) {
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

        // Setup a dropdown for PDFs.
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
        $('#dropdownAnnoPrimary ul').html('');
        $('#dropdownAnnoReference ul').html('');
        $('#dropdownAnnoPrimary .js-text').text('Select Anno file');
        $('#dropdownAnnoReference .js-text').text('Select reference Anno files');

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

        // Resize dropdown height.
        // resizeHandler();

    });

}

/**
 * Get a filename from a path.
 */
function _excludeBaseDirName(filePath) {
    let frgms = filePath.split('/');
    return frgms[frgms.length - 1];
}


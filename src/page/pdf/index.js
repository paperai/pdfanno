/**
 *  Functions depending on pdfanno-core.js.
 */
import { reloadPDFViewer, setupColorPicker, displayAnnotation } from '../util/display';
import { enableAnnotateTool, disableAnnotateTools, clearAllAnnotations } from '../util/anno';


// /**
//  * Load PDFs and Annos via Browse button.
//  */
// export function loadFiles(files) {

//     // Load data.
//     return loadData(files);
// }

/**
 * Load PDFs and Annos via Browse button.
 */
export function loadFiles(files) {

    let fileMap = window.pdfanno.fileMap = {};

    let { pdfNames, annoNames } = getContents(files);

    return new Promise((resolve, reject) => {

        let promises = [];

        // Load pdfs.
        let p = pdfNames.map(file => {
            return new Promise((resolve, reject) => {
                let fileReader = new FileReader();
                fileReader.onload = event => {
                    let pdf = event.target.result;
                    let fileName = _excludeBaseDirName(file.webkitRelativePath);
                    window.pdfanno.fileMap[fileName] = pdf;
                    resolve();
                }
                fileReader.readAsDataURL(file);
            });
        });
        promises = promises.concat(p);

        // Load annos.
        p = annoNames.map(file => {
            return new Promise((resolve, reject) => {
                let fileReader = new FileReader();
                fileReader.onload = event => {
                    let annotation = event.target.result;
                    let fileName = _excludeBaseDirName(file.webkitRelativePath);
                    window.pdfanno.fileMap[fileName] = annotation;
                    resolve();
                }
                fileReader.readAsText(file);
            });
        });
        promises = promises.concat(p);

        // Wait for complete.
        Promise.all(promises).then(resolve);

    }).then(() => {
        return { fileMap, pdfNames, annoNames };
    });
}

/**
 * Extract PDFs and annotations from files the user specified.
 */
function getContents(files) {
    let pdfNames = [];
    let annoNames = [];

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
            pdfNames.push(file);
        } else if (relativePath.match(/\.anno$/i)) {
            annoNames.push(file);
        }
    }

    return {
        pdfNames,
        annoNames
    };
}

/**
 * Get a filename from a path.
 */
function _excludeBaseDirName(filePath) {
    let frgms = filePath.split('/');
    return frgms[frgms.length - 1];
}


/**
 *  Functions depending on pdfanno-core.js.
 */
import { reloadPDFViewer, setupColorPicker, displayAnnotation } from '../util/display';

import globalVariable from './globalVariable';

/**
 * Load PDFs and Annos via Browse button.
 */
export default function loadFiles(files) {

    let { pdfNames, annoNames } = getContents(files);

    // TODO Remove.
    // Save.
    globalVariable.pdfNames = pdfNames.map(f => _excludeBaseDirName(f.webkitRelativePath));
    globalVariable.annoNames = annoNames.map(f => _excludeBaseDirName(f.webkitRelativePath));

    return new Promise((resolve, reject) => {

        // TODO Remove.
        // Initialize.
        globalVariable.pdfDataMap = {};
        globalVariable.annoDataMap = {};

        let promises = [];

        // Load pdfs.
        let p = pdfNames.map(file => {
            return new Promise((resolve, reject) => {
                let fileReader = new FileReader();
                fileReader.onload = event => {
                    let pdf = event.target.result;
                    let fileName = _excludeBaseDirName(file.webkitRelativePath);
                    globalVariable.pdfDataMap[fileName] = pdf;

                    resolve({
                        type    : 'content',
                        name    : fileName,
                        content : pdf
                    });
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
                    let anno = event.target.result;
                    let fileName = _excludeBaseDirName(file.webkitRelativePath);
                    globalVariable.annoDataMap[fileName] = anno;
                    resolve({
                        type    : 'anno',
                        name    : fileName,
                        content : anno
                    });
                }
                fileReader.readAsText(file);
            });
        });
        promises = promises.concat(p);

        // Wait for complete.
        Promise.all(promises).then(results => {

            const contents = results.filter(r => r.type === 'content');
            const annos = results.filter(r => r.type === 'anno');

            resolve({ contents, annos });
        });

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


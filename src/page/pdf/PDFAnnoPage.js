import AbstractAnnoPage from '../AbstractAnnoPage';

import loadFiles from './loadFiles';

/**
 * PDFAnno's Annotation functions for Page produced by .
 */
export default class PDFAnnoPage extends AbstractAnnoPage {

    constructor() {
        super(...arguments);
    }

    /**
     * @inheritDoc.
     */
    loadFiles(files) {
        return loadFiles(files).then(result => {
            this.contentFiles = result.contents.map(c => {
                return Object.assign(c, {
                    selected : false
                });
            });
            this.annoFiles = result.annos.map(a => {
                return Object.assign(a, {
                    primary   : false,
                    reference : false
                });
            });
        });
    }

    getContentFileList() {
        return this.contentFiles;
    }

    getContentFile(name) {
        const items = this.contentFiles.filter(c => c.name === name);
        if (items.length > 0) {
            return items[0];
        }
        return null;
    }

    getAnnoFileList() {
        return this.annoFiles;
    }

    getAnnoFile(name) {
        const items = this.annoFiles.filter(c => c.name === name);
        if (items.length > 0) {
            return items[0];
        }
        return null;
    }

    displayContent(contentName) {

        let contentFile = this.contentFiles.filter(c => c.name === contentName);
        if (contentFile.length === 0) {
            console.log('displayContent: NOT FOUND FILE. file=', contentName);
            return;
        }

        displayViewer(contentFile[0]);
    }


    displayViewer(contentFile) {

        if (contentFile) {
            window.pdf = contentFile.content;
            window.pdfName = contentFile.name;
        } else {
            window.pdf = null;
            window.pdfName = null;
        }

        // Reset setting.
        resetPDFViewerSettings();

        // Reload pdf.js.
        $('#viewer iframe').remove();
        $('#viewer').html('<iframe src="./pages/viewer.html?file=../pdfs/P12-1046.pdf" class="anno-viewer" frameborder="0"></iframe>');

        // Restart.
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('restartApp', true, true, null);
        window.dispatchEvent(event);

        // Catch the event iframe is ready.
        // function iframeReady() {
        //     console.log('iframeReady');
        //     window.removeEventListener('annotationrendered', iframeReady);
        // }
        // window.addEventListener('annotationrendered', iframeReady);

    }

    displayPrimaryAnnoFile(annoFile) {



        // reload.
        displayAnnotation(true);

        // Close
        $('#dropdownAnnoPrimary').click();

        return false;


    }


    deleteAllAnnotations() {
        // TODO Implement.
    }


}


/**
 * Reset PDF Viewer settings.
 */
function resetPDFViewerSettings() {
    localStorage.removeItem('database');
}


/**
 * Display annotations an user selected.
 */
function displayAnnotation(isPrimary, reload=true) {

    let annotations = [];
    let colors = [];
    let primaryIndex = -1;

    // Primary annotation.
    if (isPrimary) {
        $('#dropdownAnnoPrimary a').each((index, element) => {
            let $elm = $(element);
            if ($elm.find('.fa-check').hasClass('no-visible') === false) {
                let annoPath = $elm.find('.js-annoname').text();
                if (!window.pdfanno.fileMap[annoPath]) {
                    console.log('ERROR');
                    return;
                }
                primaryIndex = 0;
                annotations.push(window.pdfanno.fileMap[annoPath]);
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
                if (!window.pdfanno.fileMap[annoPath]) {
                    console.log('ERROR');
                    return;
                }
                annotations.push(window.pdfanno.fileMap[annoPath]);
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

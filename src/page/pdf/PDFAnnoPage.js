import AbstractAnnoPage from '../AbstractAnnoPage';
import loadFiles from './loadFiles';
import { anyOf, dispatchWindowEvent } from '../../shared/util';

import {
    listenWindowLeaveEvent,
    unlistenWindowLeaveEvent,
    adjustViewerSize,
    resizeHandler,
    setupResizableColumns
} from '../util/window';

/**
 * PDFAnno's Annotation functions for Page produced by .
 */
export default class PDFAnnoPage extends AbstractAnnoPage {

    constructor() {
        super(...arguments);
        this.setup();
    }

    setup() {
        this.listenWindowEvents();
    }

    listenWindowEvents() {
        window.addEventListener('digit1Pressed' , () => {
            this.createSpan();
        });
        window.addEventListener('digit2Pressed' , () => {
            this.createRelation('one-way');
        });
        window.addEventListener('digit3Pressed' , () => {
            this.createRelation('two-way');
        });
        window.addEventListener('digit4Pressed' , () => {
            this.createRelation('link');
        });
    }

    /**
     * Start PDFAnno Application.
     */
    startViewerApplication() {

        // TODO Refactoring: "iframeWindow -> window event" make as common.

        // Alias for convenience.
        window.iframeWindow = $('#viewer iframe').get(0).contentWindow;

        iframeWindow.addEventListener('DOMContentLoaded', () => {

            // Adjust the height of viewer.
            adjustViewerSize();

            // Reset the confirm dialog at leaving page.
            unlistenWindowLeaveEvent();
        });

        iframeWindow.addEventListener('annotationrendered', () => {

            // Restore the status of AnnoTools.
            this.disableAnnotateFunctions();
            this.enableAnnotateFunction(window.currentAnnoToolType);

            dispatchWindowEvent('annotationrendered');
        });

        // Set the confirm dialog when leaving a page.
        iframeWindow.addEventListener('annotationUpdated', () => {
            listenWindowLeaveEvent();
            dispatchWindowEvent('annotationUpdated');
        });

        // enable text input.
        iframeWindow.addEventListener('enableTextInput', (e) => {
            dispatchWindowEvent('enableTextInput', e.detail);
        });

        // disable text input.
        iframeWindow.addEventListener('disappearTextInput', () => {
            dispatchWindowEvent('disappearTextInput', e.detail);
        });

        iframeWindow.addEventListener('annotationDeleted', e => {
            dispatchWindowEvent('annotationDeleted', e.detail);
        });

        iframeWindow.addEventListener('annotationHoverIn' , e => {
            dispatchWindowEvent('annotationHoverIn', e.detail);
        });

        iframeWindow.addEventListener('annotationHoverOut' , e => {
            dispatchWindowEvent('annotationHoverOut', e.detail);
        });

        iframeWindow.addEventListener('annotationSelected' , e => {
            dispatchWindowEvent('annotationSelected', e.detail);
        });

        iframeWindow.addEventListener('annotationDeselected' , () => {
            dispatchWindowEvent('annotationDeselected');
        });

        iframeWindow.addEventListener('digit1Pressed' , () => {
            dispatchWindowEvent('digit1Pressed');
        });

        iframeWindow.addEventListener('digit2Pressed' , () => {
            dispatchWindowEvent('digit2Pressed');
        });

        iframeWindow.addEventListener('digit3Pressed' , () => {
            dispatchWindowEvent('digit3Pressed');
        });

        iframeWindow.addEventListener('digit4Pressed' , () => {
            dispatchWindowEvent('digit4Pressed');
        });
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

    getContentFile(name) {
        const items = this.contentFiles.filter(c => c.name === name);
        if (items.length > 0) {
            return items[0];
        }
        return null;
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

    }

    /**
     * Create a Span annotation.
     */
    createSpan() {

        const rects = window.iframeWindow.PDFAnnoCore.UI.getRectangles();

        // Check empty.
        if (!rects) {
            return alert('Please select a text span first.');
        }

        // Check duplicated.
        let annos = window.iframeWindow.annotationContainer
                        .getAllAnnotations()
                        .filter(a => a.type === 'span')
                        .filter(a => {
                            if (rects.length !== a.rectangles.length) {
                                return false;
                            }
                            for (let i = 0; i < rects.length; i++) {
                                if (rects[i].x !== a.rectangles[i].x
                                    || rects[i].y !== a.rectangles[i].y
                                    || rects[i].width !== a.rectangles[i].width
                                    || rects[i].height !== a.rectangles[i].height) {
                                    return false;
                                }
                            }
                            return true;
                        });

        if (annos.length > 0) {
            // Show label input.
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('enableTextInput', true, true, {
                uuid : annos[0].uuid,
                text : annos[0].text
            });
            window.dispatchEvent(event);
            return;
        }

        // Create a new rectAnnotation.
        window.iframeWindow.PDFAnnoCore.UI.createSpan();
    }


    /**
     * Create a Relation annotation.
     */
    createRelation(type) {

        let selectedAnnotations = window.iframeWindow.annotationContainer.getSelectedAnnotations();
        selectedAnnotations = selectedAnnotations.filter(a => {
            return a.type === 'area' || a.type === 'span';
        }).sort((a1, a2) => {
            return (a1.selectedTime - a2.selectedTime); // asc
        });

        if (selectedAnnotations.length < 2) {
            return alert('Please select two annotations first.');
        }

        const first  = selectedAnnotations[selectedAnnotations.length - 2];
        const second = selectedAnnotations[selectedAnnotations.length - 1];
        console.log('first:second,', first, second);

        // Check duplicated.
        const arrows = window.iframeWindow.annotationContainer
                        .getAllAnnotations()
                        .filter(a => a.type === 'relation')
                        .filter(a => {
                            return anyOf(a.rel1Annotation.uuid, [first.uuid, second.uuid])
                                    && anyOf(a.rel2Annotation.uuid, [first.uuid, second.uuid])
                        });

        if (arrows.length > 0) {
            console.log('same found!!!');
            // Update!!
            arrows[0].direction = type;
            arrows[0].rel1Annotation = first;
            arrows[0].rel2Annotation = second;
            arrows[0].save();
            arrows[0].render();
            arrows[0].enableViewMode();
            // Show label input.
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('enableTextInput', true, true, {
                uuid : arrows[0].uuid,
                text : arrows[0].text
            });
            window.dispatchEvent(event);
            return;
        }

        window.iframeWindow.PDFAnnoCore.UI.createRelation(type, first, second);
    }

    /**
        Disable annotation tool buttons.
    */
    disableRect() {
        window.iframeWindow.PDFAnnoCore.UI.disableRect();
        // TODO 以下のは必要？
        window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
    }

    /**
     * Enable an annotation tool.
     */
    enableRect() {
        window.iframeWindow.PDFAnnoCore.UI.enableRect();
    }

    /**
        Disable annotation tool buttons.
    */
    disableAnnotateFunctions() {
        window.iframeWindow.PDFAnnoCore.UI.disableRect();
        window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
    }

    /**
     * Enable an annotation tool.
     */
    enableAnnotateFunction(type) {
        if (type === 'rect') {
            window.iframeWindow.PDFAnnoCore.UI.enableRect();
        }
    }

    /**
     * Clear the all annotations from the view and storage.
     */
    clearAllAnnotations() {
        localStorage.removeItem('_pdfanno_containers');
        localStorage.removeItem('_pdfanno_primary_annoname');
    }

}


/**
 * Reset PDF Viewer settings.
 */
function resetPDFViewerSettings() {
    localStorage.removeItem('database');
}


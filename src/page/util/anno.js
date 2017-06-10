/**
 * Annotations.
 */



/**
    Disable annotation tool buttons.
*/
export function disableAnnotateTools() {
    window.iframeWindow.PDFAnnoCore.UI.disableRect();
    window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
}

/**
 * Enable an annotation tool.
 */
export function enableAnnotateTool(type) {

    if (type === 'rect') {
        window.iframeWindow.PDFAnnoCore.UI.enableRect();
    }
}

/**
 * Clear the all annotations from the view and storage.
 */
// TODO move to PDFAnno.js
export function clearAllAnnotations() {
    localStorage.removeItem('_pdfanno_containers');
    localStorage.removeItem('_pdfanno_primary_annoname');
}

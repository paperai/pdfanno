/**
 * Annotations.
 */



/**
    Disable annotation tool buttons.
*/
export function disableAnnotateTools() {
    window.iframeWindow.PDFAnnoCore.UI.disableRect();
    window.iframeWindow.PDFAnnoCore.UI.disableSpan();
    window.iframeWindow.PDFAnnoCore.UI.disableRelation();
    window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
}

/**
 * Enable an annotation tool.
 */
export function enableAnnotateTool(type) {

    if (type === 'span') {
        window.iframeWindow.PDFAnnoCore.UI.enableSpan();

    } else if (type === 'one-way') {
        window.iframeWindow.PDFAnnoCore.UI.enableRelation('one-way');

    } else if (type === 'two-way') {
        window.iframeWindow.PDFAnnoCore.UI.enableRelation('two-way');

    } else if (type === 'link') {
        window.iframeWindow.PDFAnnoCore.UI.enableRelation('link');

    } else if (type === 'rect') {
        window.iframeWindow.PDFAnnoCore.UI.enableRect();
    }
}


/**
 * Clear the all annotations from the view and storage.
 */
export function clearAllAnnotations() {
    localStorage.removeItem('_pdfanno_containers');
    localStorage.removeItem('_pdfanno_primary_annoname');
}

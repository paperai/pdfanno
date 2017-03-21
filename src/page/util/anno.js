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

/**
 * The padding of page top.
 */
const paddingTop = 9;

/**
 * The padding between pages.
 */
const paddingBetweenPages = 9;

/**
 * Convert the `y` position from the local coords to exported json.
 */
export function convertToExportY(y) {

    let meta = getPageSize();

    y -= paddingTop;

    let pageHeight = meta.height + paddingBetweenPages;

    let pageNumber = Math.floor(y / pageHeight) + 1;
    let yInPage = y - (pageNumber-1) * pageHeight;

    return { pageNumber, y : yInPage };
}

/**
 * Get a page size of a single PDF page.
 */
function getPageSize() {

    let pdfView = window.PDFView || iframeWindow.PDFView;

    let viewBox = pdfView.pdfViewer.getPageView(0).viewport.viewBox;
    let size = { width : viewBox[2], height : viewBox[3] };
    return size;
}

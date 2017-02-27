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

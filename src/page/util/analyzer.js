
/**
 * Convert analyze results as page-based.
 */
export function customizeAnalyzeResult (pdftxt) {

    let pages = []
    let page
    let body
    let meta
    pdftxt.split('\n').forEach(line => {
        if (page && !line) {
            body += ' '
            meta.push(line)
        } else {
            const info = line.split('\t')
            if (!isTextLine(info)) {
                return
            }
            let {
                page : pageNumber,
                type,
                char
            } = extractMeta(info)
            if (!page) {
                page = pageNumber
                body = ''
                meta = []
            } else if (page !== pageNumber) {
                pages.push({
                    body,
                    meta,
                    page
                })
                body = ''
                meta = []
                page = pageNumber
            }
            if (type === 'TEXT') {
                // Special replace, like "[NO_UNICODE\]"
                if (char.length >= 2) {
                    char = '?'
                }
                body += char
                meta.push(line)
            }
        }
    })
    pages.push({
        body,
        meta,
        page
    })

    return pages
}

/**
 * Check the line is TEXT.
 */
function isTextLine (info) {
    return info.length >= 2 && info[2] === 'TEXT'
}

/**
 * Interpret the meta data.
 */
export function extractMeta (info) {

    if (typeof info === 'string') {
        info = info.split('\t')
    }

    const [ x, y, w, h ] = info[4].split(' ').map(parseFloat)

    return {
        position : parseInt(info[0]),
        page     : parseInt(info[1]),
        type     : info[2],
        char     : info[3],
        x,
        y,
        w,
        h
    }
}

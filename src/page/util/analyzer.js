
/**
 * Convert analyze results as page-based.
 */
export function customizeAnalyzeResult (analyzeData) {

    let pages = []
    let page
    let body
    let meta
    analyzeData.split('\n').forEach(line => {
        if (page && !line) {
            body += ' '
            meta.push(line)
        } else {
            let {
                page : pageNumber,
                type,
                char
            } = extractMeta(line)
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
 * Interpret the meta data.
 */
export function extractMeta (meta) {

    const info = meta.split('\t')

    return {
        position : parseInt(info[0]),
        page     : parseInt(info[1]),
        type     : info[2],
        char     : info[3],
        x        : parseFloat(info[4]),
        y        : parseFloat(info[5]),
        w        : parseFloat(info[6]),
        h        : parseFloat(info[7])
    }
}

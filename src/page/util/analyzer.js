
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
            let [
                pageNumber,
                type,
                char
            ] = line.split('\t')
            pageNumber = parseInt(pageNumber, 10)
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
                // Special replace.
                if (char.length >= 2) {
                    char = '?'  // Like "[NO_UNICODE\]"
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

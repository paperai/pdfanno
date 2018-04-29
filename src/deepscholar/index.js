/**
 * PDFAnno for DeepScholar.
 *
 * Refs:
 *  https://github.com/paperai/paperanno-ja/blob/master/with-deepscholar.md
 */
import { parseUrlQuery } from '../shared/util'

/**
 * Check whether PDFAnno should behave for DeepScholar.
 */
export function isTarget () {
  const params = parseUrlQuery()
  return params['api_root'] && params['paper_id']
}

/**
 * Init for displaying for DeepScholar.
 */
export async function initialize () {

  // Remove `Browse` button.
  $('.js-file').remove()

  // fetch API.
  const params = parseUrlQuery()
  let url = window.API_ROOT + `internal/api/deepscholar/${params['paper_id']}`
  const queries = Object.keys(params).map(key => {
    return `${key}=${params[key]}`
  })
  url += '?' + queries.join('&')
  console.log('url:', url)

  const response = await fetch(url)
  if (response.status !== 200) {
    // TODO デザインをanno-uiのダイアログに変更.
    return alert('API Error.')
  }
  const json = await response.json()

  // Get results.
  const pdfBase64 = json.pdf
  const pdf = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0))
  console.log('pdfBase64:', pdfBase64.length)
  const pdfName = json.pdfName
  const pdftxt = json.pdftxt
  console.log('pdftxt:', pdftxt.length)
  const annotations = json.annotations
  console.log('annotations:', annotations)

  // TODO need maybe.
  // Init viewer.
  // window.annoPage.initializeViewer(null)
  // // Start application.
  // window.annoPage.startViewerApplication()

  // Display PDF.
  window.annoPage.displayViewer({
    name    : pdfName,
    content : pdf
  })

  
}

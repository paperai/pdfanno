/**
 * PDFAnno for DeepScholar.
 *
 * Refs:
 *  https://github.com/paperai/paperanno-ja/blob/master/with-deepscholar.md
 */
import { parseUrlQuery } from '../shared/util'
import { showLoader } from '../page/util/display'

/**
 * Check whether PDFAnno should behave for DeepScholar.
 */
export function isTarget () {
  const params = parseUrlQuery()
  return params['api_root'] && params['document_id']
}

/**
 * Init for displaying for DeepScholar.
 */
export async function initialize () {

  // UI for DeepScholar.
  $(document.body).addClass('deepscholar')

  try {

    // fetch API.
    const data = await fetchResources()

    // Get results.
    const pdfBase64 = data.pdf
    const pdf = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0))
    console.log('pdfBase64:', pdfBase64.length)
    const pdfName = data.pdfName
    const pdftxt = data.pdftxt
    console.log('pdftxt:', pdftxt.length)
    const annotations = data.annotations
    console.log('annotations:', annotations)

    // Display PDF.
    window.annoPage.displayViewer({
      name    : pdfName,
      content : pdf
    })

  } catch (e) {
    alert('Error!!')
    console.log('deepscholer view error:', e)

  } finally {
    showLoader(false)
  }

}

/**
 * Fetch the resources from API - PDF, pdftxt, annotations.
 * @returns {Promise<*>}
 */
async function fetchResources() {
  const params = parseUrlQuery()
  let url = window.API_ROOT + `internal/api/deepscholar/${params['document_id']}`
  const queries = Object.keys(params).map(key => {
    return `${key}=${params[key]}`
  })
  url += '?' + queries.join('&')

  const response = await fetch(url)
  if (response.status !== 200) {
    // TODO デザインをanno-uiのダイアログに変更.
    return alert('API Error.')
  }
  return await response.json()
}

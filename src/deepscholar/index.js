/**
 * PDFAnno for DeepScholar.
 *
 * Refs:
 *  https://github.com/paperai/paperanno-ja/blob/master/with-deepscholar.md
 */
import { parseUrlQuery } from '../shared/util'
import * as textLayer from '../page/textLayer'
import { showLoader } from '../page/util/display'

// Get data from URL query.
const params = parseUrlQuery()
const apiRoot = params['api_root']
const documentId = params['document_id']
const userToken = params['user_token']
const userId = params['user_id']

/**
 * Check whether PDFAnno should behave for DeepScholar.
 */
export function isTarget () {
  return apiRoot && documentId
}

/**
 * Init for displaying for DeepScholar.
 */
export async function initialize () {

  // UI for DeepScholar.
  $(document.body).addClass('deepscholar')

  try {

    const data = await fetchResources()

    displayPDF(data.pdf, data.pdfName)

    addTextLayer(data.pdftxt)

    showPrimaryAnnotation(data.annotations)

    showReferenceAnnotation(data.annotations)

    setupUploadButton()

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

  // TODO LogタブにAPIのログを表示する.
}

/**
 * Display a PDF.
 * @param pdfBase64 - PDF from DeepScholar.
 * @param pdfName - the PDF name.
 */
function displayPDF(pdfBase64, pdfName) {

  const pdf = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0))

  // Display PDF.
  window.annoPage.displayViewer({
    name    : pdfName,
    content : pdf
  })
}

/**
 * Add text layers.
 * @param pdftxt - pdftxt from DeepScholar.
 */
function addTextLayer (pdftxt) {
  textLayer.setup(pdftxt)
  window.annoPage.pdftxt = pdftxt
}

/**
 * Display and setup the primary annotations.
 * @param annotations - annotations from DeepScholar.
 */
function showPrimaryAnnotation (annotations) {
  // TODO あとでデータができたら実装する.
  console.log('annotations:', annotations)

  // userIdを元に、自分のアノテーションを取得.
  // 画面に表示.
  // Anno Fileのセレクトボックスにも表示（セレクトボックスはReadOnlyにしよう）
  // Anno Listのセレクトボックスにも表示
  // moveクエリがあればそれを強調表示.

}

/**
 * Setup the reference annotations.
 * @param annotations - annotations from DeepScholar.
 */
function showReferenceAnnotation (annotations) {
  // TODO あとでデータができたら実装する.
  console.log('annotations:', annotations)

  // userIdを元に、自分以外のアノテーションを取得.
  // ReferenceAnnoのセレクトボックスに表示.
}

/**
 * Setup the upload button.
 */
function setupUploadButton () {

  // TODO 実装する.
  // userIdがない状態でボタンを押したら、エラー表示.
  // upload用のAPIを開発.
  // アノテーションをAPI経由でアップロード.
  // 成功したらその旨を表示する.
  // 失敗したらエラーを返す.
  // Logタブにも表示.
}

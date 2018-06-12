/**
 * Create text layers which enable users to select texts.
 */
import { customizeAnalyzeResult, extractMeta } from './util/analyzer'
import { dispatchWindowEvent } from '../shared/util'

let pages

/**
 * Setup text layers.
 */
export function setup (analyzeData) {
  console.log('textLayer:setup')

  pages = customizeAnalyzeResult(analyzeData)

  // Renew text layers.
  $('.textLayer', window.iframeWindow.document).each(function () {
    const page = $(this).parent('.page').data('page-number')
    createTextLayer(page)
  })

  // Listen pageRendered event.
  window.removeEventListener('pagerendered', listenPageRendered)
  window.addEventListener('pagerendered', listenPageRendered)
}

/**
 * Listen pageRendered event, and create a new text layer.
 */
function listenPageRendered (ev) {
  const page = ev.detail.pageNumber
  console.log('textLayer:pageRendered:', page)
  createTextLayer(page)
}

/**
 * Create a new text layer.
 */
function createTextLayer (page) {

  // Disabled.

  // setTimeout(() => {
  //
  //   console.log('createTextLayer:', page)
  //
  //   const $textLayer = $(`.page[data-page-number="${page}"] .textLayer`, window.iframeWindow.document)
  //
  //   // Create text div elements.
  //   if (!pages[page - 1] || !pages[page - 1].meta) {
  //     console.log('modify:', pages, page)
  //     return
  //   }
  //   const scale = window.iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.scale
  //
  //   let snipet = ''
  //   pages[page - 1].meta.forEach((info, index) => {
  //
  //     if (!info) {
  //       return
  //     }
  //     const { char, x, y, w, h } = extractMeta(info)
  //
  //     const style = `
  //               top: ${y * scale}px;
  //               left: ${x * scale}px;
  //               width: ${w * scale}px;
  //               height: ${h * scale}px;
  //               font-size: ${h * 0.85}px;
  //               line-height: ${h * scale}px;
  //               text-align: center;
  //           `.replace(/\n/g, '')
  //
  //     snipet += `
  //               <div
  //                   class="pdfanno-text-layer"
  //                   style="${style}"
  //                   data-page="${page}"
  //                   data-index="${index}">${char}</div>
  //           `
  //   })
  //
  //   $textLayer[0].innerHTML = snipet
  //
  //   dispatchWindowEvent('textlayercreated', page)
  //
  // }, window.iframeWindow.TEXT_LAYER_RENDER_DELAY + 300)
}

// TODO a little tricky.
window.getText = function (page, startIndex, endIndex) {
  const infos = pages[page - 1].meta.slice(startIndex, endIndex + 1)
  const texts = infos.map(info => {
    if (!info) {
      return ' '
    } else {
      // TODO こんなmetaを扱う処理は、どこかにまとめておかないとメンテナンスが非常に大変..
      return info.split('\t')[3]
    }
  })
  const text = texts.join('')

  // Text position.
  // TODO Use pdfextract.jar 0.1.6 's position data.'
  const beforeCount = pages.slice(0, page - 1)
    .reduce((v, page) => v.concat(page.meta), [])
    .filter(info => info).length
  const start1 = pages[page - 1].meta.slice(0, startIndex + 1).filter(info => info).length
  const start2 = pages[page - 1].meta.slice(0, endIndex + 1).filter(info => info).length
  const textRange = [ (beforeCount + start1), (beforeCount + start2) ]
  // Return.
  return { text, textRange }
}

window.findText = function (page, point) {

  for (let index = 0, len = pages[page - 1].meta.length; index < len; index++) {
    const info = pages[page - 1].meta[index]

    if (!info) {
      continue
    }

    const { position, char, x, y, w, h } = extractMeta(info)

    // is Hit?
    if (x <= point.x && point.x <= (x + w)
      && y <= point.y && point.y <= (y + h)) {
      return { position, char, x, y, w, h }
    }
  }

  return null
}

window.findTexts = function (page, startPosition, endPosition) {

  const items = []

  if (startPosition == null || endPosition == null) {
    return items
  }

  let inRange = false

  for (let index = 0, len = pages[page - 1].meta.length; index < len; index++) {
    const info = pages[page - 1].meta[index]

    if (!info) {
      if (inRange) {
        items.push(null)
      }
      continue
    }

    const data = extractMeta(info)
    const { position } = data

    if (startPosition <= position) {
      inRange = true
      items.push(data)
    }

    if (endPosition <= position) {
      break
    }
  }

  return items
}










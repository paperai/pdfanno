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

// TODO a little tricky.
window.findTexts = function (page, rect) {

  let found = false
  let text = ''
  let rects = []
  let startIndex = 0
  let endIndex = 0

  pages[page - 1].meta.forEach((info, index) => {

    if (!info) {
      if (found) {
        text += ' '
      }
      return
    }
    const { char, x, y, w, h } = extractMeta(info)

    // is Hit?
    if (Math.abs(rect.x - x) < rect.w / 2 + w / 2
      && Math.abs(rect.y - y) < rect.h / 2 + h / 2) {
      console.log("hitX:", char, rect.x, (rect.x + rect.w), x, (x + w))
      console.log("hitY:", char, rect.y, (rect.y + rect.h), y, (y + h))

      found = true
      text += char
      rects.push({ x, y, w, h })

      if (!startIndex) {
        startIndex = index
      }
      endIndex = Math.max(endIndex, index)

    } else {
      found = false
    }
  })

  let { textRange } = window.getText(page, startIndex, endIndex)

  return { text, rects, textRange }
}















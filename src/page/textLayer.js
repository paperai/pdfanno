/**
 * Create text layers which enable users to select texts.
 */
import { customizeAnalyzeResult, extractMeta } from './util/analyzer'

/**
 * Text layer data.
 */
let pages

/**
 * Setup text layers.
 */
export function setup (analyzeData) {
  // Create text layers data.
  pages = customizeAnalyzeResult(analyzeData)
}

/**
 * Find the text.
 * @param page - the page number.
 * @param point - { x, y } coords.
 * @returns {*} - The text data if found, whereas null.
 */
window.findText = function (page, point) {

  const metaList = pages[page - 1].meta

  for (let i = 0, len = metaList.length; i < len; i++) {
    const info = metaList.meta[i]

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

/**
 * Find the texts.
 * @param page - the page number.
 * @param startPosition - the start position in pdftxt.
 * @param endPosition - the end position in pdftxt.
 * @returns {Array} - the texts.
 */
window.findTexts = function (page, startPosition, endPosition) {

  const items = []

  if (startPosition == null || endPosition == null) {
    return items
  }

  const metaList = pages[page - 1].meta

  let inRange = false

  for (let index = 0, len = metaList.length; index < len; index++) {

    const info = metaList[index]

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

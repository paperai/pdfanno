import * as Constants from './constants'

/**
 * Utility.
 */

 /**
  * @param {Any} target
  * @param {Array} candidates
  */
export function anyOf (target, candidates) {
  return candidates.filter(c => c === target).length > 0
}

/**
 * Dispatch a custom event to `window` object.
 */
export function dispatchWindowEvent (eventName, data) {
  var event = document.createEvent('CustomEvent')
  event.initCustomEvent(eventName, true, true, data)
  window.dispatchEvent(event)
}

/**
 * Parse URL queries, and return it as a Map.
 * @returns {{}}
 */
// TODO make as common?
export function parseUrlQuery () {
  return window.location.search
    .replace('?', '')
    .split('&')
    .reduce((map, keyValue) => {
      const [ key, value ] = keyValue.split('=')
      map[key] = value
      return map
    }, {})
}

/**
 * get Page Container of PDF Viewer.
 * @returns {Integer}
 */
export function getContainer (page) {
  return document.getElementById(Constants.PAGE_CONTAINER_ID + page)
}

/**
 * get AnnoLayer of PDF Viewer.
 * @returns {Integer}
 */
export function getAnnoLayer (page) {
  const container = document.getElementById(Constants.PAGE_CONTAINER_ID + page)
  if (container) {
    const annoLayer = container.getElementsByClassName(Constants.ANNO_LAYER_CLASS_NAME)
    if (annoLayer.length > 0) {
      return annoLayer[0]
    }
  }
  return null
}

/**
 *
 * @param {any} pages
 */
export function parsePageParam (pages) {
  if (pages === undefined) {
    pages = parsePageParam({first : 1, last : window.PDFView.pdfViewer.pagesCount})
  } else if (typeof pages === 'number') {
    pages = [pages]
  } else if (Array.isArray(pages)) {
    // Array is also objects.
  } else if (typeof pages === 'object') {
    pages = Array.from({length : pages.last - pages.first + 1}, (v, k) => k + pages.first)
  } else {
    return []
  }
  return pages
}

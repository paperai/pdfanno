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
 * @returns {jQueryObject}
 */
export function getContainer (page) {
  return $([
    '#',
    Constants.PAGE_CONTAINER_ID,
    page
  ].join(''))
}

/**
 * get AnnoLayer of PDF Viewer.
 * @returns {jQueryObject}
 */
export function getAnnoLayer (page) {
  return $([
    '#',
    Constants.PAGE_CONTAINER_ID,
    page,
    ' .',
    Constants.ANNO_LAYER_CLASS_NAME
  ].join(''))
}

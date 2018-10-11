import * as Utils from '../../../shared/util'

/**
 * Enable Text input enable.
 */
export function enable ({ uuid, text, disable = false, autoFocus = false, blurListener = null }) {
  Utils.dispatchWindowEvent('enableTextInput', ...arguments)
  // console.log('dispatchEvent:', event, arguments[0])
}

/**
 * Disable the text input.
 */
export function disable () {
  Utils.dispatchWindowEvent('disappearTextInput')
}

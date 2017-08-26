/**
 * Enable Text input enable.
 */
export function enable ({ uuid, text, disable = false, autoFocus = false, blurListener = null }) {
    var event = document.createEvent('CustomEvent')
    event.initCustomEvent('enableTextInput', true, true, ...arguments)
    window.dispatchEvent(event)
}

/**
 * Disable the text input.
 */
export function disable () {
    var event = document.createEvent('CustomEvent')
    event.initCustomEvent('disappearTextInput', true, true)
    window.dispatchEvent(event)
}

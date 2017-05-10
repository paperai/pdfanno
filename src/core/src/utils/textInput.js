

/**
 * Enable Text input enable.
 */
export function enable({ uuid, text, disable=false, autoFocus=false, blurListener=null }) {

    console.log('textInput.enable:', ...arguments);

    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('enableTextInput', true, true, ...arguments);
    window.dispatchEvent(event);
}

/**
 * Disable the text input.
 */
export function disable() {

    console.log('textInput.disable');

    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('disappearTextInput', true, true);
    window.dispatchEvent(event);
}

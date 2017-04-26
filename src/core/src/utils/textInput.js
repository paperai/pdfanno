

/**
 * Enable Text input enable.
 */
export function enable({ uuid, text, autoFocus=false, blurListener }) {

    console.log('textInput.enable:', uuid, text, autoFocus, blurListener);

    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('enableTextInput', true, true, { uuid, text, autoFocus, blurListener });
    window.dispatchEvent(event);
}

/**
 * Disable the text input.
 */
export function disable(uuid) {

    console.log('textInput.disable:', uuid);

    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('disappearTextInput', true, true, { uuid });
    window.dispatchEvent(event);
}

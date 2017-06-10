/**
 * Dispatch a custom event to `window` object.
 */
// TODO Use shared/util/dispatchWindowEvent instead.
export function dispatchWindowEvent(eventName, data) {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, true, true, data);
    window.dispatchEvent(event);
}

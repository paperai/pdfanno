import $ from 'jquery';

/**
 * Prevent page-back behavior.
 */
function handleDocumentKeydown(e) {

    // enable for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return;
    }

    // Delete or BackSpace.
    if (e.keyCode == 46 || e.keyCode == 8) {
        e.preventDefault();
        return false;
    }
}

/**
 * Delete selected annotations, and prevent page-back behavior.
 */
function handleDocumentKeyup(e) {

    // enable for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return;
    }

    // Delete or BackSpace.
    if (e.keyCode == 46 || e.keyCode == 8) {
        deleteSelectedAnnotations();
        e.preventDefault();
        return false;
    }
}

/**
 * Delete selected annotations.
 */
function deleteSelectedAnnotations() {
    window.globalEvent.emit('deleteSelectedAnnotation');
}

/**
 * Make annotations view mode.
 */
function setAnnotationViewMode() {
    window.globalEvent.emit('enableViewMode');
}

/**
 * Make annotations NOT view mode.
 */
function resetAnnotationViewMode() {
    window.globalEvent.emit('disableViewMode');
}

/**
 * Enable view mode.
 */
export function enableViewMode() {
    console.log('view:enableViewMode');

    // disableViewMode();

    window.viewMode = true;

    setAnnotationViewMode();

    document.removeEventListener('keyup', handleDocumentKeyup);
    document.removeEventListener('keydown', handleDocumentKeydown);
    document.addEventListener('keyup', handleDocumentKeyup);
    document.addEventListener('keydown', handleDocumentKeydown);

}

/**
 * Disable view mode.
 */
export function disableViewMode() {
    console.log('view:disableViewMode');
    window.viewMode = false;
    // resetAnnotationViewMode();
    // document.removeEventListener('keyup', handleDocumentKeyup);
    // document.removeEventListener('keydown', handleDocumentKeydown);
}

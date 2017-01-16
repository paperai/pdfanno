import $ from 'jquery';

function handleDocumentKeydown(e) {
    // Delete or BackSpace.
    if (e.keyCode == 46 || e.keyCode == 8) {
        e.preventDefault();
        return false;
    }
}

function handleDocumentKeyup(e) {
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

function setComponenTranslucent(translucent) {

    if (translucent) {
        $('svg > *').addClass('--viewMode');

    } else {
        $('svg > *').removeClass('--viewMode');
    }
}

function setAnnotationViewMode() {
    window.globalEvent.emit('enableViewMode');
}

function resetAnnotationViewMode() {
    window.globalEvent.emit('disableViewMode');
}

export function enableViewMode() {
    this.disableViewMode();
    setComponenTranslucent(true);
    setAnnotationViewMode();
    document.addEventListener('keyup', handleDocumentKeyup);
    document.addEventListener('keydown', handleDocumentKeydown);
}

export function disableViewMode() {
    setComponenTranslucent(false);
    resetAnnotationViewMode();
    document.removeEventListener('keyup', handleDocumentKeyup);
    document.removeEventListener('keydown', handleDocumentKeydown);
}
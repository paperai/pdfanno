import $ from 'jquery';

/**
 * Disable the action of pageback, if `DEL` or `BackSpace` button pressed.
 */
function disablePagebackAction(e) {

    // console.log('disablePagebackAction:', e);

    // enable any keyboard events for <input/>.
    if (e.target.tagName.toLowerCase() === 'input') {
        return;
    }

    // Delete or BackSpace.
    if (e.keyCode == 46 || e.keyCode == 8) {
        e.preventDefault();

        if (e.type === 'keyup') {
            deleteSelectedAnnotations();
        }

        return false;
    }
}


// /**
//  * Prevent page-back behavior.
//  */
// function handleDocumentKeydown(e) {

//     // enable for <input/>.
//     if (e.target.tagName.toLowerCase() === 'input') {
//         return;
//     }

//     // Delete or BackSpace.
//     if (e.keyCode == 46 || e.keyCode == 8) {
//         e.preventDefault();
//         return false;
//     }
// }

// *
//  * Delete selected annotations, and prevent page-back behavior.

// function handleDocumentKeyup(e) {

//     // enable for <input/>.
//     if (e.target.tagName.toLowerCase() === 'input') {
//         return;
//     }

//     // Delete or BackSpace.
//     if (e.keyCode == 46 || e.keyCode == 8) {
//         deleteSelectedAnnotations();
//         e.preventDefault();
//         return false;
//     }
// }

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

// TODO NO NEED `enableViewMode` event ?

// /**
//  * Make annotations NOT view mode.
//  */
// function resetAnnotationViewMode() {
//     window.globalEvent.emit('disableViewMode');
// }

// TODO NO NEED `disableViewMode` event ?

/**
 * Enable view mode.
 */
export function enableViewMode() {
    console.log('view:enableViewMode');

    // disableViewMode();

    window.viewMode = true;

    setAnnotationViewMode();

    document.removeEventListener('keyup', disablePagebackAction);
    document.removeEventListener('keydown', disablePagebackAction);
    document.addEventListener('keyup', disablePagebackAction);
    document.addEventListener('keydown', disablePagebackAction);

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
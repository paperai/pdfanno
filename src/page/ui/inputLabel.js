/**
 * UI parts - Input Label.
 */

 let $inputLabel;
 let $form;
 window.addEventListener('DOMContentLoaded', () => {
    $inputLabel = $('#inputLabel');
    $form = $('#autocompleteform');
 });

let _blurListener;

let currentUUID;

export function enable({ uuid, text, disable=false, autoFocus=false, blurListener=null }) {
    console.log('enableInputLabel:', uuid, text);

    currentUUID = uuid;

    if (_blurListener) {
        _blurListener();
        _blurListener = null;
        console.log('old _blurListener is called.');
    }

    $form
        .off('submit')
        .on('submit', cancelSubmit);

    $inputLabel
        .attr('disabled', 'disabled')
        .val(text || '')
        .off('blur')
        .off('keyup');

    if (disable === false) {
        $inputLabel
            .removeAttr('disabled')
            .on('keyup', () => {
                saveText(uuid);
            });
    }

    if (autoFocus) {
        $inputLabel.focus();
    }

    $inputLabel.on('blur', () => {

        if (blurListener) {
            blurListener();
            _blurListener = blurListener;
        }

        saveText(uuid);

        // Add an autocomplete candidate. (Firefox, Chrome)
        $form.find('[type="submit"]').click();
    });

};

export function disable() {
    console.log('disableInputLabel');

    currentUUID = null;

    $inputLabel
        .attr('disabled', 'disabled')
        .val('');
}

export function treatAnnotationDeleted({ uuid }) {
    console.log('treatAnnotationDeleted:', uuid);

    if (currentUUID === uuid) {
        disable(...arguments);
    }
}

export function handleAnnotationHoverIn(annotation) {
    if (getSelectedAnnotations().length === 0) {
        enable({ uuid : annotation.uuid, text : annotation.text, disable : true });
    }
}

export function handleAnnotationHoverOut(annotation) {
    if (getSelectedAnnotations().length === 0) {
        disable();
    }
}

export function handleAnnotationSelected(annotation) {
    if (getSelectedAnnotations().length === 1) {
        enable({ uuid : annotation.uuid, text : annotation.text });
    } else {
        disable();
    }
}

export function handleAnnotationDeselected() {
    const annos = getSelectedAnnotations();
    if (annos.length === 1) {
        enable({ uuid : annos[0].uuid, text : annos[0].text });
    } else {
        disable();
    }
}

function getSelectedAnnotations() {
    return iframeWindow.annotationContainer.getSelectedAnnotations();
}

function cancelSubmit(e) {
  e.preventDefault();
  return false;
}

function saveText(uuid) {

    const text = $inputLabel.val() || '';

    const annotation = window.iframeWindow.annotationContainer.findById(uuid);
    if (annotation) {
        annotation.text = text;
        // annotation.setTextForceDisplay();
        // annotation.render();
        annotation.save();
        annotation.enableViewMode();

        // setTimeout(() => {
        //     annotation.resetTextForceDisplay();
        //     annotation.render();
        //     annotation.enableViewMode();
        // }, 1000);
    }

}

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

export function enable({ uuid, text, autoFocus, blurListener }) {
    console.log('enableInputLabel:', uuid, text);

    if (_blurListener) {
        _blurListener();
        _blurListener = null;
        console.log('old _blurListener is called.');
    }

    $form
        .off('submit')
        .on('submit', cancelSubmit);

    $inputLabel
        .removeAttr('disabled')
        .val(text || '')
        .off('blur')
        .off('keyup')
        .on('keyup', () => {

            // const text = $inputLabel.val() || '';

            // const annotation = window.iframeWindow.annotationContainer.findById(uuid);
            // if (annotation) {
            //     annotation.text = text;
            //     // annotation.setTextForceDisplay();
            //     // annotation.render();
            //     annotation.save();
            //     annotation.enableViewMode();

            //     // setTimeout(() => {
            //     //     annotation.resetTextForceDisplay();
            //     //     annotation.render();
            //     //     annotation.enableViewMode();
            //     // }, 1000);
            // }

            saveText(uuid);

            // console.log('keyup:', uuid, text, annotation);

            // disable({ uuid });
        });

    if (autoFocus) {
        $inputLabel.focus();
    }

    $inputLabel.on('blur', () => {

        if (blurListener) {
            // $inputLabel.on('blur', blurListener);
            blurListener();
            _blurListener = blurListener;
        }

        saveText(uuid);

        // Add an autocomplete candidate. (Firefox, Chrome)
        $form.find('[type="submit"]').click();

        disable({ uuid });

    });

    // if (blurListener) {
    //     $inputLabel.on('blur', blurListener);
    //     _blurListener = blurListener;
    // }

};

export function disable({ uuid }) {
    console.log('disableInputLabel');

    $inputLabel
        .attr('disabled', 'disabled')
        .val('');
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

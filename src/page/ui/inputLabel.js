/**
 * UI parts - Input Label.
 */

 let $inputLabel;
 window.addEventListener('DOMContentLoaded', () => {
    $inputLabel = $('#inputLabel');
 });

export function enable({ uuid, text, autoFocus, blurListener }) {
    console.log('enableInputLabel:', uuid, text);
    $inputLabel
        .removeAttr('disabled')
        .val(text || '')
        .off('blur')
        .off('change')
        .on('change', () => {

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

            console.log('change:', uuid, text, annotation);

            disable({ uuid });
        });

    if (autoFocus) {
        $inputLabel.focus();
    }

    if (blurListener) {
        $inputLabel.on('blur', blurListener);
    }

};

export function disable({ uuid }) {
    console.log('disableInputLabel');

    $inputLabel
        .attr('disabled', 'disabled')
        .val('');
}

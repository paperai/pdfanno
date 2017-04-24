/**
 * UI parts - Input Label.
 */

 let $inputLabel;
 window.addEventListener('DOMContentLoaded', () => {
    $inputLabel = $('#inputLabel');
 });

export function enable({ uuid, text, autoFocus=true }) {
    console.log('enableInputLabel:', uuid, text);
    $inputLabel
        .removeAttr('disabled')
        .val(text || '')
        .one('blur', () => {

            const text = $inputLabel.val() || '';
            console.log('blur:', uuid, text);

            const annotation = window.iframeWindow.annotationContainer.findById(uuid);
            if (annotation) {
                annotation.text = text;
                annotation.setTextForceDisplay();
                annotation.render();
                annotation.save();
                annotation.enableViewMode();

                setTimeout(() => {
                    annotation.resetTextForceDisplay();
                    annotation.render();
                    annotation.enableViewMode();
                }, 1000);
            }

            disable({ uuid });
        });

    if (autoFocus) {
        $inputLabel.focus();
    }

};

export function disable({ uuid }) {
    console.log('disableInputLabel');

    $inputLabel
        .attr('disabled', 'disabled')
        .val('');
}

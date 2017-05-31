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

/**
 * Local storage key for datalist.
 */
const LSKEY_DATALIST = '_pdfanno_datalist';

function setDatalist() {

    // set datalist.
    let datalist = JSON.parse(localStorage.getItem(LSKEY_DATALIST) || '[]');
    const options = datalist.map(d => {
        return `<option value="${d}"></option>`;
    });
    $('#labels').html(options);
}

export function setup() {

    // set datalist.
    setDatalist();

    // Setup datalist modal.
    $('#datalistModal').off().on('show.bs.modal', e => {

        // datalist.
        let datalist = JSON.parse(localStorage.getItem(LSKEY_DATALIST) || '[]');

        // input for new.
        datalist.push('');

        const snipets = datalist.map(d => {
            return `
            <li class="list-group-item">
                <input class="form-control js-input" value="${d}">
                <span class="glyphicon glyphicon-remove js-delete"></span>
            </li>
            `;
        });

        $('#datalistModal .js-datalist').html(snipets.join(''));

    });

    $('#datalistModal').on('keyup', '.js-input', e => {

        const $this = $(e.currentTarget);
        const val = $this.val();
        const isEnd = $this.parent().is(':last-child');

        if (isEnd && val && val.length > 0) {
            $('#datalistModal .js-datalist').append(`
                <li class="list-group-item">
                    <input class="form-control js-input" value="">
                    <span class="glyphicon glyphicon-remove js-delete"></span>
                </li>
            `);
        }
    });

    $('#datalistModal').on('click', '.js-delete', e => {
        $(e.currentTarget).parent().remove();
    });

    $('#datalistModal .js-done').on('click', e => {

        let datalist = [];
        $('#datalistModal .js-datalist .js-input').each(function() {
            const val = $(this).val();
            if (val && val.length > 0) {
                datalist.push(val);
            }
        });

        localStorage.setItem(LSKEY_DATALIST, JSON.stringify(datalist));

        setDatalist();

        $('#datalistModal').modal('hide');
    });
}

import $ from 'jquery';
import PDFAnnoCore from '../PDFAnnoCore';
import appendChild from '../render/appendChild';
import {
  BORDER_COLOR,
  getMetadata,
  scaleDown,
  getSVGLayer
} from './utils';

/**
 * The text size at editing.
 */
const TEXT_SIZE = 12;

/**
 * The text color at editing.
 */
const TEXT_COLOR = '#FF0000';

/*
 * The input field for adding/editing a text.
 */
let input = null;

/*
 * The callback called at finishing to add/edit a text.
 */
let _finishCallback = null;

/**
 * Show an input field for adding a text annotation.
 *
 * @param {Number} x - The x-axis position to show.
 * @param {Number} y - The y-axis position to show.
 * @param {String} selfId - The annotation id used for registration.
 * @param {Function} finishCallback - The callback function will be called after registration.
 */
export function addInputField(x, y, selfId=null, text=null, finishCallback=null) {

  // This is a dummy form for adding autocomplete candidates at finishing adding/editing.
  // At the time to finish editing, submit via the submit button, then regist an autocomplete content.
  let $form = $('<form id="autocompleteform" action="./"/>').css({
    position : 'absolute',
    top      : '0',
    left     : '0'
  });
  $form.on('submit', handleSubmit);
  $form.append('<input type="submit" value="submit"/>'); // needs for Firefox emulating submit event.
  $(document.body).append($form);

  input = document.createElement('input');
  input.setAttribute('id', 'pdf-annotate-text-input');
  input.setAttribute('placeholder', 'Enter text');
  input.setAttribute('name', 'paperannotext');
  input.style.border = `3px solid ${BORDER_COLOR}`;
  input.style.borderRadius = '3px';
  input.style.position = 'absolute';
  input.style.top = `${y}px`;
  input.style.left = `${x}px`;
  input.style.fontSize = `${TEXT_SIZE}px`;
  input.style.width = '150px';
  input.style.zIndex = 4; // fixme.

  if (selfId) {
    input.setAttribute('data-self-id', selfId);
  }

  if (text) {
    input.value = text;
  }

  _finishCallback = finishCallback;


  input.addEventListener('blur', handleInputBlur);
  input.addEventListener('keyup', handleInputKeyup);

  $form.append(input);

  // for Chrome.
  setTimeout(() => {
    input.focus();
  }, 100);
}

/*
 * Handle form.submit event.
 * @param {Event} e - Submit event.
 */
function handleSubmit(e) {
  e.preventDefault();
  return false;
}

/**
 * Handle input.blur event.
 */
function handleInputBlur() {
  saveText();
}

/**
 * Handle input.keyup event.
 * @param {Event} e The DOM event to handle
 */
function handleInputKeyup(e) {
  if (e.keyCode === 27) {
    closeInput();
  }
}

/**
 * Save a text annotation from input.
 */
function saveText() {

  if (!input) {
    return;
  }

  let content = input.value.trim();
  if (!content) {
    return closeInput('');
  }

  let clientX = parseInt(input.style.left, 10);
  let clientY = parseInt(input.style.top, 10);
  let svg = getSVGLayer();

  let { documentId, pageNumber } = getMetadata(svg);
  let rect = svg.getBoundingClientRect();
  let annotation = Object.assign({
      type    : 'textbox',
      content : content
    }, scaleDown(svg, {
      x      : clientX - rect.left,
      y      : clientY -  rect.top,
      width  : input.offsetWidth,
      height : input.offsetHeight
    })
  );

  // RelationId.
  let selfId = input.getAttribute('data-self-id');
  if (selfId) {
    annotation.uuid = selfId;
  }

  // Add an autocomplete candidate. (Firefox, Chrome)
  $('#autocompleteform [type="submit"]').click();

    closeInput(content);

}

/**
 * Close the input.
 * @param {Object} textAnnotation - the annotation registerd.
 */
export function closeInput(text) {

  if (input) {

    $(input).parents('form').remove();
    input = null;

    if (_finishCallback) {
      _finishCallback(text);
    }
  }

  _finishCallback = null;

}

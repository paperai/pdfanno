import PDFJSAnnotate from '../PDFJSAnnotate';
import appendChild from '../render/appendChild';
import {
  BORDER_COLOR,
  findSVGAtPoint,
  getMetadata,
  scaleDown
} from './utils';

const LSKEY_INPUT_HISTORY = '_pdfanno_inputhistory';

let _enabled = false;
let input;
let _textSize;
let _textColor;

let datalist;

let _finishCallback = null;
/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {
  if (input || !findSVGAtPoint(e.clientX, e.clientY)) {
    return;
  }
  addInputField(e.clientX, e.clientY);
}

/**
 * Show an input field for adding a text annotation.
 *
 * @param {Number} x - The x-axis position to show.
 * @param {Number} y - The y-axis position to show.
 * @param {String} selfId - The annotation id used for registration.
 * @param {Function} finishCallback - The callback function will be called after registration.
 */
export function addInputField(x, y, selfId=null, text=null, finishCallback=null) {
  input = document.createElement('input');
  input.setAttribute('id', 'pdf-annotate-text-input');
  input.setAttribute('placeholder', 'Enter text');
  input.style.border = `3px solid ${BORDER_COLOR}`;
  input.style.borderRadius = '3px';
  input.style.position = 'absolute';
  input.style.top = `${y}px`;
  input.style.left = `${x}px`;
  input.style.fontSize = `${_textSize}px`;
  input.style.width = '150px';

  if (selfId) {
    input.setAttribute('data-self-id', selfId);
  }

  if (text) {
    input.value = text;
  }

  _finishCallback = finishCallback;

  input.addEventListener('blur', handleInputBlur);
  input.addEventListener('keyup', handleInputKeyup);

  document.body.appendChild(input);
  input.focus();

  // AutoComplete.
  input.autocomplete = 'on';
  input.setAttribute('list', 'mylist');
  datalist = document.createElement('datalist');
  datalist.id = 'mylist';
  getInputHistories().forEach(text => {
    let option = document.createElement('option');
    option.value = text;
    datalist.appendChild(option);
  });
  document.body.appendChild(datalist);
}

/**
 * Handle input.blur event.
 */
function handleInputBlur() {
  console.log('handleInputBlur');
  saveText();
}

/**
 * Handle input.keyup event.
 *
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
  if (input.value.trim().length > 0) {
    let clientX = parseInt(input.style.left, 10);
    let clientY = parseInt(input.style.top, 10);
    let svg = findSVGAtPoint(clientX, clientY);
    if (!svg) {
      return;
    }

    let content = input.value.trim();
    if (!content) {
      return;
    }

    let { documentId, pageNumber } = getMetadata(svg);
    let rect = svg.getBoundingClientRect();
    let annotation = Object.assign({
        type: 'textbox',
        size: _textSize,
        color: _textColor,
        content: content
      }, scaleDown(svg, {
        x: clientX - rect.left,
        y: clientY -  rect.top,
        width: input.offsetWidth,
        height: input.offsetHeight
      })
    );

    // RelationId.
    let selfId = input.getAttribute('data-self-id');
    if (selfId) {
      annotation.uuid = selfId;
    }

    PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation)
      .then((annotation) => {
        appendChild(svg, annotation);

        closeInput(annotation);
      });

    addInputHistory(content);
  
  } else {
    closeInput();
  }
  
}

/**
 * Close the input.
 */
export function closeInput(textAnnotation) {
  
  if (input) {
    input.removeEventListener('blur', handleInputBlur);
    input.removeEventListener('keyup', handleInputKeyup);
    document.body.removeChild(input);
    input = null;

    if (_finishCallback) {
      _finishCallback(textAnnotation);
    }
  }

  if (datalist) {
    datalist.parentNode.removeChild(datalist);
  }
}

function getInputHistories() {
  let histories = localStorage.getItem(LSKEY_INPUT_HISTORY);
  if (!histories) {
    histories = '[]';
  }
  return JSON.parse(histories);  
}

function addInputHistory(text) {
  let histories = getInputHistories();
  histories.unshift(text);
  histories = histories.slice(0, 15); // Max size for histories (this is temporary).
  // Make as unique.
  histories = histories.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
  localStorage.setItem(LSKEY_INPUT_HISTORY, JSON.stringify(histories));
}

/**
 * Set the text attributes
 *
 * @param {Number} textSize The size of the text
 * @param {String} textColor The color of the text
 */
export function setText(textSize = 12, textColor = '000000') {
  _textSize = parseInt(textSize, 10);
  _textColor = textColor;
}


/**
 * Enable text behavior
 */
export function enableText() {
  if (_enabled) { return; }

  _enabled = true;
  document.addEventListener('mouseup', handleDocumentMouseup);
}


/**
 * Disable text behavior
 */
export function disableText() {
  if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mouseup', handleDocumentMouseup);
  closeInput();
}


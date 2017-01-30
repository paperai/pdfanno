import { addEventListener, removeEventListener, fireEvent } from './event';
import { disableRect, enableRect } from './rect';
import { disableHighlight, enableHighlight } from './highlight';
import { disableText, enableText } from './text';
import { disableArrow, enableArrow } from './arrow';
import { disableViewMode, enableViewMode } from './view';

export default {
  addEventListener, removeEventListener, fireEvent,

  disableRect, enableRect,
  disableHighlight, enableHighlight,
  disableText, enableText,
  disableArrow, enableArrow,
  disableViewMode, enableViewMode
};


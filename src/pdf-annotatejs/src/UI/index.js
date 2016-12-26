import { addEventListener, removeEventListener, fireEvent } from './event';
import { disableEdit, enableEdit } from './edit';
import { disablePen, enablePen, setPen } from './pen';
import { disablePoint, enablePoint } from './point';
import { disableRect, enableRect } from './rect';
import { disableHighlight, enableHighlight } from './highlight';
import { disableText, enableText } from './text';
import { createPage, renderPage } from './page';

// extends.
import { disableArrow, enableArrow } from './arrow';
import { disableViewMode, enableViewMode } from './view';

export default {
  addEventListener, removeEventListener, fireEvent,
  disableEdit, enableEdit,
  disablePen, enablePen, setPen,
  disablePoint, enablePoint,
  disableRect, enableRect,
  disableHighlight, enableHighlight,
  disableText, enableText,
  createPage, renderPage,

  // extends
  disableArrow, enableArrow,
  disableViewMode, enableViewMode
};

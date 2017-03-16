import uuid from '../utils/uuid';
import AbstractAnnotation from './abstract';
import TextAnnotation from './text';
import { scaleDown } from '../UI/utils';

let globalEvent;

/**
 * Rect Annotation.
 */
export default class RectAnnotation extends AbstractAnnotation {

    /**
     * Constructor.
     */
    constructor() {

        super();

        globalEvent = window.globalEvent;

        this.uuid     = null;
        this.type     = 'area';
        this.x        = 0;
        this.y        = 0;
        this.width    = 0;
        this.height   = 0;
        this.text     = null;
        this.color    = null;
        this.readOnly = false;
        this.$element = this.createDummyElement();

        globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation);
        globalEvent.on('enableViewMode', this.enableViewMode);

        globalEvent.on('enableRelation', this.disableDragAction);
        globalEvent.on('disableRelation', this.enableDragAction);

        this.textAnnotation = new TextAnnotation(this.readOnly, this);
        this.textAnnotation.on('selected', this.handleTextSelected);
        this.textAnnotation.on('deselected', this.handleTextDeselected);
        this.textAnnotation.on('hoverin', this.handleTextHoverIn);
        this.textAnnotation.on('hoverout', this.handleTextHoverOut);
        this.textAnnotation.on('textchanged', this.handleTextChanged);
    }

    /**
     * Create an instance from an annotation data.
     */
    static newInstance(annotation) {
        let rect      = new RectAnnotation();
        rect.uuid     = annotation.uuid || uuid();
        rect.x        = annotation.x;
        rect.y        = annotation.y;
        rect.width    = annotation.width;
        rect.height   = annotation.height;
        rect.text     = annotation.text;
        rect.color    = annotation.color;
        rect.readOnly = annotation.readOnly || false;
        return rect;
    }

    /**
     * Set a hover event.
     */
    setHoverEvent() {
        this.$element.find('rect, circle').hover(
            this.handleHoverInEvent,
            this.handleHoverOutEvent
        );
    }

    /**
     * Delete the annotation from rendering, a container in window, and a container in localStorage.
     */
    destroy() {
        super.destroy();
        this.emit('delete');
        window.globalEvent.removeListener('deleteSelectedAnnotation', this.deleteSelectedAnnotation);
        window.globalEvent.removeListener('enableViewMode', this.enableViewMode);
    }

    /**
     * Create an annotation data for save.
     */
    createAnnotation() {
        return {
            uuid      : this.uuid,
            type      : this.type,
            x         : this.x,
            y         : this.y,
            width     : this.width,
            height    : this.height,
            text      : this.text,
            color     : this.color,
            readyOnly : this.readOnly
        };
    }

    /**
     * Delete the annotation if selected.
     */
    deleteSelectedAnnotation() {
        super.deleteSelectedAnnotation();
    }

    /**
     * Get the position for text.
     */
    getTextPosition() {
        return {
            x : this.x + 7,
            y : this.y - 20
        };
    }

    /**
     * Get the position of the boundingCircle.
     */
    getBoundingCirclePosition() {
        let $circle = this.$element.find('circle');
        return {
            x : parseFloat($circle.attr('cx')),
            y : parseFloat($circle.attr('cy'))
        };
    }

    /**
     * Handle a selected event on a text.
     */
    handleTextSelected() {
        this.select();
    }

    /**
     * Handle a deselected event on a text.
     */
    handleTextDeselected() {
        this.deselect();
    }

    /**
     * Handle a hovein event on a text.
     */
    handleTextHoverIn() {
        this.highlight();
        this.emit('hoverin');
    }

    /**
     * Handle a hoveout event on a text.
     */
    handleTextHoverOut() {
        this.dehighlight();
        this.emit('hoverout');
    }

    /**
     * Save a new text.
     */
    handleTextChanged(newText) {
        console.log('rect:handleTextChanged:', newText);
        this.text = newText;
        this.save();
    }

    /**
     * Handle a hoverin event.
     */
    handleHoverInEvent(e) {
        this.highlight();
        this.emit('hoverin');

        let $elm = $(e.currentTarget);
        if ($elm.prop("tagName") === 'circle') {
            this.emit('circlehoverin', this);
        }
    }

    /**
     * Handle a hoverout event.
     */
    handleHoverOutEvent(e) {
        this.dehighlight();
        this.emit('hoverout');

        let $elm = $(e.currentTarget);
        if ($elm.prop("tagName") === 'circle') {
            this.emit('circlehoverout', this);
        }
    }

    /**
     * Handle a click event.
     */
    handleClickEvent() {
        this.toggleSelect();
    }

    /**
     * Handle a mousedown event.
     */
    handleMouseDownOnRect() {
        console.log('handleMouseDownOnRect');

        this.originalX = this.x;
        this.originalY = this.y;

        document.addEventListener('mousemove', this.handleMouseMoveOnDocument);
        document.addEventListener('mouseup', this.handleMouseUpOnDocument);

        window.globalEvent.emit('rectmovestart');

        this.disableTextlayer();
    }

    /**
     * Handle a mousemove event.
     */
    handleMouseMoveOnDocument(e) {

        this._dragging = true;

        if (!this.startX) {
            this.startX = parseInt(e.clientX);
            this.startY = parseInt(e.clientY);
        }
        this.endX = parseInt(e.clientX);
        this.endY = parseInt(e.clientY);

        let diff = scaleDown({
            x : this.endX - this.startX,
            y : this.endY - this.startY
        });

        this.x = this.originalX + diff.x;
        this.y = this.originalY + diff.y;

        this.render();

        this.emit('rectmove', this);
    }

    /**
     * Handle a mouseup event.
     */
    handleMouseUpOnDocument() {

        if (this._dragging) {
            this._dragging = false;

            this.originalX = null;
            this.originalY = null;
            this.startX = null;
            this.startY = null;
            this.endX = null;
            this.endY = null;

            this.save();
            this.enableViewMode();
            globalEvent.emit('rectmoveend', this);
        }


        document.removeEventListener('mousemove', this.handleMouseMoveOnDocument);
        document.removeEventListener('mouseup', this.handleMouseUpOnDocument);

        if (window.currentType !== 'rect') {
            this.enableTextlayer();
        }
    }

    // TODO 共通化？
    disableTextlayer() {
      $('.textLayer').hide();
    }

    // TODO 共通化？
    enableTextlayer() {
      $('.textLayer').show();
    }


    enableDragAction() {
        this.$element.find('.anno-rect, circle')
            .off('mousedown', this.handleMouseDownOnRect)
            .on('mousedown', this.handleMouseDownOnRect);
    }

    disableDragAction() {
        this.$element.find('.anno-rect, circle')
            .off('mousedown', this.handleMouseDownOnRect);
    }

    /**
     * Enable view mode.
     */
    enableViewMode() {

        console.log('rect:enableViewMode');

        super.enableViewMode();

        if (!this.readOnly) {
            this.$element.find('.anno-rect, circle').on('click', this.handleClickEvent);
            this.enableDragAction();
        }
    }

    /**
     * Disable view mode.
     */
    disableViewMode() {
        super.disableViewMode();
        this.$element.find('.anno-rect, circle').off('click');
        this.disableDragAction();
    }

}

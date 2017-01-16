import assign from 'deep-assign';
import appendChild from '../render/appendChild';
import uuid from '../utils/uuid';
import { getSVGLayer } from '../UI/utils';
import { addInputField } from '../UI/text';
import { enableViewMode, disableViewMode } from '../UI/view';
import AbstractAnnotation from './abstract';
import TextAnnotation from './text';
import PDFJSAnnotate from '../PDFJSAnnotate';
import {
    scaleUp,
    scaleDown,
    getMetadata,
    disableUserSelect,
    enableUserSelect
} from '../UI/utils';

/**
 * Rect Annotation.
 */
export default class RectAnnotation extends AbstractAnnotation {

    constructor() {
        super();
        this.uuid     = null;
        this.type     = 'area';
        this.x        = 0;
        this.y        = 0;
        this.width    = 0;
        this.height   = 0;
        this.text     = null;
        this.color    = null;
        this.readOnly = false;
        this.$element = $('<div class="dummy"/>');

        window.globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation);
        window.globalEvent.on('enableViewMode', this.enableViewMode);
        window.globalEvent.on('disableViewMode', this.disableViewMode);

        this.textAnnotation = new TextAnnotation(this);
        this.textAnnotation.on('hoverin', this.handleTextHoverIn);
        this.textAnnotation.on('hoverout', this.handleTextHoverOut);
        this.textAnnotation.on('textchanged', this.handleTextChanged);
    }

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

    render() {
         this.$element.remove();
         this.$element = $(appendChild(getSVGLayer(), this));
         this.setHoverEvent();
         this.textAnnotation.render();
    }

    setHoverEvent() {
        this.$element.find('rect, circle').hover(
            this.handleHoverInEvent, 
            this.handleHoverOutEvent
        );
    }

    destroy() {
        this.$element.remove();
        window.annotationContainer.remove(this);
        let { documentId } = getMetadata(); // TODO Remove this.
        PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, this.uuid).then(() => {
            console.log('deleted');
        });
        this.textAnnotation.destroy();
        this.emit('delete');
    }

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

    save() {
        // TODO Competible to insert and update.
        let { documentId } = getMetadata();
        PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, this.uuid).then(a => {
            if (a) {
                // update.
                a = this.createAnnotation(a);
                console.log('save:', a);
                PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, this.uuid, a);
            } else {
                // insert.
                a = this.createAnnotation();
                PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, 1, a);
            }
        });
        window.annotationContainer.add(this);
    }

    deleteSelectedAnnotation() {
        // TODO this will be better using eventEmitter on global?
        if (this.$element.find('.anno-rect').hasClass('--selected')) {
            this.destroy();
        }
        this.textAnnotation.deleteSelectedAnnotation();
    }

    getTextPosition() {
        return {
            x : this.x + 7, // 7 = DEFAULT_RADIUS + 2
            y : this.y - 20
        };
    }

    getBoundingCirclePosition() {
        let $circle = this.$element.find('circle');
        return {
            x : parseFloat($circle.attr('cx')),
            y : parseFloat($circle.attr('cy'))
        };
    }

    showBoundingCircle() {
        this.$element.find('circle').removeClass('--hide');
    }

    hideBoundingCircle() {
        this.$element.find('circle').addClass('--hide');
    }

    highlight() {
        this.$element.find('rect, text').addClass('--hover');
        this.$element.addClass('--emphasis');
        this.textAnnotation.highlight();
        // this.emit('hoverin');
    }

    dehighlight() {
        this.$element.find('rect, text').removeClass('--hover');
        this.$element.removeClass('--emphasis');
        this.textAnnotation.dehighlight();
        // this.emit('hoverout');
    }

    handleTextHoverIn() {
        this.highlight();
        this.emit('hoverin');
    }

    handleTextHoverOut() {
        this.dehighlight();
        this.emit('hoverout');
    }

    handleTextChanged(textAfter) {
        this.text = textAfter;
        this.save();
    }

    handleHoverInEvent(e) {
        this.highlight();
        this.emit('hoverin');

        let $elm = $(e.currentTarget);
        if ($elm.prop("tagName") === 'circle') {
            this.emit('circlehoverin', this);
        }
    }

    handleHoverOutEvent(e) {
        this.dehighlight();
        this.emit('hoverout');

        let $elm = $(e.currentTarget);
        if ($elm.prop("tagName") === 'circle') {
            this.emit('circlehoverout', this);
        }
    }

    handleClickRectEvent() {
        this.$element.find('.anno-rect').toggleClass('--selected');
    }

    handleDoubleClickTextEvent() {
        console.log('handleDoubleClickTextEvent');

        let svg = getSVGLayer();
        let pos = scaleUp(svg, {
            x : this.x,
            y : this.y
        });
        let rect = svg.getBoundingClientRect();
        pos.x += rect.left;
        pos.y += rect.top;

        disableViewMode(); // TODO Refactoring.

        addInputField(pos.x, pos.y - 20, this.uuid, this.text, (text) => {

            if (text) {
                this.text = text;
                this.save();
                this.render();
                // TODO Refactoring.
                this.enableViewMode();
            }

            enableViewMode(); // TODO Refactoring.

        }, 'text');

    }

    handleMouseDownOnRect() {
        console.log('handleMouseDownOnRect');

        this.originalX = this.x;
        this.originalY = this.y;

        disableUserSelect();

        document.addEventListener('mousemove', this.handleMouseMoveOnDocument);
        document.addEventListener('mouseup', this.handleMouseUpOnDocument);

        this.emit('rectmovestart', this);
    }

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

        this.render(); // heavy?

        this.emit('rectmove', this);
    }

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

            this.emit('rectmoveend', this);
        }

        enableUserSelect();

        document.removeEventListener('mousemove', this.handleMouseMoveOnDocument);
        document.removeEventListener('mouseup', this.handleMouseUpOnDocument);            

    }

    enableViewMode() {

        if (!this.readOnly) {

            this.$element.find('.anno-rect, circle').off('click', this.handleClickRectEvent).on('click', this.handleClickRectEvent);
            this.$element.find('.anno-rect, circle').off('mousedown', this.handleMouseDownOnRect).on('mousedown', this.handleMouseDownOnRect);         
        }

        this.textAnnotation.enableViewMode();
    }

    disableViewMode() {
        this.$element.find('.anno-rect').off('click', this.handleClickRectEvent);
        this.$element.find('.anno-rect').off('mousedown', this.handleMouseDownOnRect);
        this.textAnnotation.disableViewMode();
    }

}
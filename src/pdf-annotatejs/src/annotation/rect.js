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

// TODO Refactoring - remove text implements.


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

        this.textAnnotation = new TextAnnotation(this);
        this.textAnnotation.on('hoverin', this.handleTextHoverIn);
        this.textAnnotation.on('hovverout', this.handleTextHoverOut);
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
        rect.readOnly = annotation.readOnly;
        return rect;
    }

    render() {
         this.$element.remove();
         this.$element = $(appendChild(getSVGLayer(), this));
         this.textAnnotation.render();
    }

    destroy() {
        this.$element.remove();
        window.annotationContainer.remove(this);
    }

    createAnnotation() {
        // TODO Refactring.
        return {
            uuid   : this.uuid,
            type   : this.type,
            x      : this.x,
            y      : this.y,
            width  : this.width,
            height : this.height,
            text   : this.text,
            color  : this.color,
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
        console.log('deleteSelectedAnnotation');
        // TODO Refactoring.
        if (this.$element.find('.anno-rect').hasClass('--selected')) {
            this.$element.remove();
            let { documentId } = getMetadata();
            PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, this.uuid).then(() => {
                console.log('deleted');
            });
            this.textAnnotation.destroy();
            window.annotationContainer.remove(this);
        
        } else if (this.$element.find('.anno-text').hasClass('--selected')) {
            this.text = null;
            this.save();
            this.render();
            this.enableViewMode();
        }

        this.textAnnotation.deleteSelectedAnnotation();
    }

    getTextPosition() {
        return {
            x : this.x + 7, // 7 = DEFAULT_RADIUS + 2
            y : this.y - 20
        };
    }

    handleTextHoverIn() {
        // TODO Refactoring CSS.
        this.$element.find('rect').addClass('--hover');
        this.$element.css('opacity', 1);
    }

    handleTextHoverOut() {
        this.$element.find('rect').removeClass('--hover');
        this.$element.css('opacity', 0.5);
    }

    handleTextChanged(textAfter) {
        this.text = textAfter;
        this.save();
    }

    handleHoverInEvent() {
        this.$element.find('rect, text').addClass('--hover');
        // TODO Refactoring.
        this.$element.css('opacity', 1);
        this.emit('hoverin');
    }

    handleHoverOutEvent() {
        this.$element.find('rect, text').removeClass('--hover');
        // TODO Refactoring.
        this.$element.css('opacity', 0.5);
        this.emit('hoverout');
    }

    handleClickRectEvent() {
        console.log('handleClickRectEvent!!!!!');
        // TODO Refactoring.
        this.$element.find('.anno-rect').toggleClass('--selected');
        if (this.$element.find('.anno-rect').hasClass('--selected')) {
            this.$element.css('opacity', 1);
        } else {
            this.$element.css('opacity', 0.5);
        }
    }

    handleClickTextEvent() {
        console.log('handleClickTextEvent');
        // TODO Refactoring.
        this.$element.find('.anno-text').toggleClass('--selected');

        // Check double click.
        let currentTime = (new Date()).getTime();
        if (this.prevClickTime && (currentTime - this.prevClickTime) < 400) {
            this.handleDoubleClickTextEvent();
        }
        this.prevClickTime = currentTime;
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

        // TODO FIXME
        // var event = document.createEvent('CustomEvent');
        // event.initCustomEvent('rectmove', true, true, {
        //   id: this.uuid
        // });
        // window.dispatchEvent(event);

        this.emit('rectmove', this);

    }

    handleMouseUpOnDocument() {
        console.log('handleMouseUpOnDocument');

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

            // TODO FIXME
            // var event = document.createEvent('CustomEvent');
            // event.initCustomEvent('rectmoveend', true, true, {
            //   id: this.uuid
            // });
            // window.dispatchEvent(event);

            this.emit('rectmoveend', this);
        }

        enableUserSelect();

        document.removeEventListener('mousemove', this.handleMouseMoveOnDocument);
        document.removeEventListener('mouseup', this.handleMouseUpOnDocument);            

    }

    enableViewMode() {

        // this.$element.addClass('anno-viewmode');

        this.$element.find('rect, circle').hover(
            this.handleHoverInEvent, 
            this.handleHoverOutEvent
        );

        if (!this.readOnly) {

            this.$element.find('.anno-rect, circle').off('click', this.handleClickRectEvent).on('click', this.handleClickRectEvent);
            // this.$element.find('text').off('click', this.handleClickTextEvent).on('click', this.handleClickTextEvent);
            // this.$element.find('text').off('dbclick', this.handleDoubleClickTextEvent).on('dbclick', this.handleDoubleClickTextEvent);

            this.$element.find('.anno-rect, circle').off('mousedown', this.handleMouseDownOnRect).on('mousedown', this.handleMouseDownOnRect);
         
        }

        this.textAnnotation.enableViewMode();
    }

    disableViewMode() {

        // this.$element.removeClass('anno-viewmode');

        this.$element.find('rect, circle').off('mouseenter mouseleave');
        this.$element.find('.anno-rect').off('click', this.handleClickRectEvent);
        // this.$element.find('text').off('click', this.handleClickTextEvent);
        // this.$element.find('text').off('dbclick', this.handleDoubleClickTextEvent);

        this.$element.find('.anno-rect').off('mousedown', this.handleMouseDownOnRect);

        this.textAnnotation.disableViewMode();
    }

}
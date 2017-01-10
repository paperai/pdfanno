import assign from 'deep-assign';
import appendChild from '../render/appendChild';
import { getSVGLayer } from '../UI/utils';
import { addInputField } from '../UI/text';
import { enableViewMode, disableViewMode } from '../UI/view';
import AbstractAnnotation from './abstract';
import PDFJSAnnotate from '../PDFJSAnnotate';
import {
    scaleUp,
    scaleDown,
    getMetadata,
    disableUserSelect,
    enableUserSelect
} from '../UI/utils';

// TODO Text should be an another annotation class.


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
        this.text     = 0;
        this.color    = null;
        this.$element = $('<div class="dummy"/>');
    }

    static newInstance(annotation) {
        let rect    = new RectAnnotation();
        rect.uuid   = annotation.uuid;
        rect.x      = annotation.x;
        rect.y      = annotation.y;
        rect.width  = annotation.width;
        rect.height = annotation.height;
        rect.text   = annotation.text;
        rect.color  = annotation.color;
        return rect;
    }

    render() {
         // TODO Refactoring.
         this.$element.remove();
         this.$element = $(appendChild(getSVGLayer(), this));
    }

    destroy() {
        this.$element.remove();
        window.annotationContainer.remove(this);
    }

    createAnnotation(a = {}) {
        // TODO Refactring.
        return assign({}, a, {
            uuid   : this.uuid,
            type   : this.type,
            x      : this.x,
            y      : this.y,
            width  : this.width,
            height : this.height,
            text   : this.text,
            color  : this.color
        });
    }

    save() {
        // TODO Competible to insert and update.
        let { documentId } = getMetadata();
        PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, this.uuid).then(a => {
            if (a) {
                // update.
                a = this.createAnnotation(a);
                PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, this.uuid, a);
            } else {
                // insert.
                a = this.createAnnotation();
                PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, 1, a);
            }
        });
    }

    deleteSelectedAnnotation() {
        console.log('deleteSelectedAnnotation');
        // TODO Refactoring.
        if (this.$element.find('.anno-rect').hasClass('--selected')) {
            this.$element.remove();
            let { documentId } = getMetadata();
            PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, this.uuid).then(() => {
                console.log('deleted');
            });
        
        } else if (this.$element.find('.anno-text').hasClass('--selected')) {
            this.text = null;
            this.save();
            this.render();
            this.enableViewMode();
        }
    }

    handleHoverInEvent() {
        this.$element.find('rect, text').addClass('--hover');
        // TODO Refactoring.
        this.$element.css('opacity', 1);
    }

    handleHoverOutEvent() {
        this.$element.find('rect, text').removeClass('--hover');
        // TODO Refactoring.
        this.$element.css('opacity', 0.5);
    }

    handleClickRectEvent() {
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

        $(document).on('mousemove', this.handleMouseMoveOnDocument);
        $(document).on('mouseup', this.handleMouseUpOnDocument);
    }

    handleMouseMoveOnDocument(e) {

        if (!this.startX) {
            this.startX = parseInt(e.originalEvent.clientX);
            this.startY = parseInt(e.originalEvent.clientY);
        }
        this.endX = parseInt(e.originalEvent.clientX);
        this.endY = parseInt(e.originalEvent.clientY);

        let diff = scaleDown({
            x : this.endX - this.startX,
            y : this.endY - this.startY
        });

        this.x = this.originalX + diff.x;
        this.y = this.originalY + diff.y;

        this.render(); // heavy?
    }

    handleMouseUpOnDocument() {
        console.log('handleMouseUpOnDocument');

        enableUserSelect();

        $(document).off('mousemove', this.handleMouseMoveOnDocument);
        $(document).off('mouseup', this.handleMouseUpOnDocument);

        this.originalX = null;
        this.originalY = null;
        this.startX = null;
        this.startY = null;
        this.endX = null;
        this.endY = null;

        this.save();
        this.enableViewMode();
    }

    enableViewMode() {

        this.$element.find('rect, text').hover(
            this.handleHoverInEvent.bind(this), 
            this.handleHoverOutEvent.bind(this)
        );

        this.$element.find('.anno-rect').on('click', this.handleClickRectEvent);
        this.$element.find('text').on('click', this.handleClickTextEvent);
        this.$element.find('text').on('dbclick', this.handleDoubleClickTextEvent);

        this.$element.find('.anno-rect').on('mousedown', this.handleMouseDownOnRect);
    }

    disableViewMode() {
        this.$element.find('rect, text').off('mouseenter mouseleave');
        this.$element.find('.anno-rect').off('click', this.handleClickRectEvent);
        this.$element.find('text').off('click', this.handleClickTextEvent);
        this.$element.find('text').off('dbclick', this.handleDoubleClickTextEvent);
    }

}
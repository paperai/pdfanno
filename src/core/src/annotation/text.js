import assign from 'deep-assign';
import appendChild from '../render/appendChild';
import { getSVGLayer } from '../UI/utils';
import { addInputField } from '../UI/text';
import { enableViewMode, disableViewMode } from '../UI/view';
import AbstractAnnotation from './abstract';
import {
    scaleUp,
    scaleDown,
    getMetadata,
    disableUserSelect,
    enableUserSelect
} from '../UI/utils';

let globalEvent;

/**
 * Text Annotation.
 */
export default class TextAnnotation extends AbstractAnnotation {

    /**
     * Constructor.
     */
    constructor(readOnly, parent) {
        super();

        globalEvent = window.globalEvent;

        this.type     = 'textbox';
        this.parent   = parent;
        this.x        = 0;
        this.y        = 0;
        this.readOnly = readOnly;
        this.$element = this.createDummyElement();

        // Updated by parent via AbstractAnnotation#setTextForceDisplay.
        this.textForceDisplay = false;

        // parent.on('rectmoveend', this.handleRectMoveEnd);

        // globalEvent.on('rectmoveend', this.handleRectMoveEnd);

        // globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation);
        // globalEvent.on('enableViewMode', this.enableViewMode);
        // globalEvent.on('disableViewMode', this.disableViewMode);
    }


    /**
     * Render a text.
     */
     render() {

        // TODO 引数で text と position を渡せば、循環参照を無くせる.

        if (this.parent.text) {
            assign(this, this.parent.getTextPosition());
            this.text = this.parent.text;
            this.color = this.parent.color;
            this.parentId = this.parent.uuid;
            super.render();
            if (this.textForceDisplay) {
                this.$element.addClass('--visible');
            }
        } else {
            this.$element.remove();
        }
    }

    /**
     * Set a hover event.
     */
    setHoverEvent() {
        this.$element.find('text').hover(
            this.handleHoverInEvent,
            this.handleHoverOutEvent
        );
    }

    /**
     * Delete a text annotation.
     */
    destroy() {
        this.$element.remove();
        this.$element = this.createDummyElement();
        // globalEvent.removeListener('rectmoveend', this.handleRectMoveEnd);
        // globalEvent.removeListener('deleteSelectedAnnotation', this.deleteSelectedAnnotation);
        // globalEvent.removeListener('enableViewMode', this.enableViewMode);
        // globalEvent.removeListener('disableViewMode', this.disableViewMode);

        // TODO Need Release memory?
        console.log('delete:text._events:', this._events);

        // cancel circle reference.
        // this.parent = null;

        console.log('text:destroy');
    }

    isHit(x, y) {

        let $rect = this.$element.find('rect');
        let x_ = $rect.attr('x');
        let y_ = $rect.attr('y');
        let w_ = $rect.attr('width');
        let h_ = $rect.attr('height');
        console.log(x,y,w,h);




        // TODO
        return false;
    }

    /**
     * Delete a text annotation if selected.
     */
    deleteSelectedAnnotation() {
        super.deleteSelectedAnnotation();
    }

    /**
     * Handle a hoverin event.
     */
    handleHoverInEvent() {
        this.highlight();
        this.emit('hoverin');
    }

    /**
     * Handle a hoverout event.
     */
    handleHoverOutEvent() {
        this.dehighlight();
        this.emit('hoverout');
    }

    /**
     * Handle a click event.
     */
    handleClickEvent() {

        let next = !this.$element.hasClass('--selected');

        if (next) {
            super.select();
            this.emit('selected');

        } else {
            super.deselect();
            this.emit('deselected');
        }

        // Check double click.
        let currentTime = (new Date()).getTime();
        if (this.prevClickTime && (currentTime - this.prevClickTime) < 400) {
            this.handleDoubleClickEvent();
        }
        this.prevClickTime = currentTime;
    }

    /**
     * Handle a click event.
     */
    handleDoubleClickEvent() {
        console.log('handleDoubleClickEvent');

        // this.destroy();
        this.$element.remove();

        let svg = getSVGLayer();
        let pos = scaleUp(svg, {
            x : this.x,
            y : this.y
        });
        let rect = svg.getBoundingClientRect();
        pos.x += rect.left;
        pos.y += rect.top;

        addInputField(pos.x, pos.y, this.uuid, this.text, (text) => {

            console.log('callback:', text);

            if (text || text === '') {
                this.text = text;
                this.emit('textchanged', text);
            }

            this.render();

            if (!this.readOnly) {
                this.$element.find('text').off('click').on('click', this.handleClickEvent);
            }

        });

    }

    // handleRectMoveEnd(rectAnnotation) {
    //     if (rectAnnotation === this.parent) {
    //         this.enableViewMode();
    //     }
    // }

    enableViewMode() {
        console.log('text:enableViewMode');

        super.enableViewMode();
        if (!this.readOnly) {
            this.$element.find('text').off('click').on('click', this.handleClickEvent);
        }
    }

    disableViewMode() {

        super.disableViewMode();
        this.$element.find('text').off('click', this.handleClickEvent);
    }

}

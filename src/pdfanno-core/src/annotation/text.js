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
    constructor(parent) {
        super();

        globalEvent = window.globalEvent;

        this.type     = 'textbox';
        this.parent   = parent;
        this.x        = 0;
        this.y        = 0;
        this.$element = this.createDummyElement();

        // Updated by parent via AbstractAnnotation#setTextForceDisplay.
        this.textForceDisplay = false;

        // parent.on('rectmoveend', this.handleRectMoveEnd);
        globalEvent.on('rectmoveend', this.handleRectMoveEnd);

        globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation);
        globalEvent.on('enableViewMode', this.enableViewMode);
        globalEvent.on('disableViewMode', this.disableViewMode);
    }


    /**
     * Render a text.
     */
     render() {
        if (this.parent.text) {
            assign(this, this.parent.getTextPosition());
            this.text = this.parent.text;
            this.color = this.parent.color;
            super.render();
            if (this.textForceDisplay) {
                this.$element.addClass('--visible');
            }
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
        globalEvent.removeListener('deleteSelectedAnnotation', this.deleteSelectedAnnotation);
        globalEvent.removeListener('enableViewMode', this.enableViewMode);
        globalEvent.removeListener('disableViewMode', this.disableViewMode);
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

        this.destroy();

        let svg = getSVGLayer();
        let pos = scaleUp(svg, {
            x : this.x,
            y : this.y
        });
        let rect = svg.getBoundingClientRect();
        pos.x += rect.left;
        pos.y += rect.top;

        disableViewMode(); // TODO Refactoring.

        addInputField(pos.x, pos.y, this.uuid, this.text, (text) => {

            console.log('callback:', text);

            if (text) {
                this.text = text;
                this.emit('textchanged', text);
                this.enableViewMode();
            }

            this.render();

            enableViewMode(); // TODO Refactoring.

        }, 'text');

    }

    handleRectMoveEnd(rectAnnotation) {
        if (rectAnnotation === this.parent) {
            this.enableViewMode();
        }
    }

    enableViewMode() {

        // Reset the state that always display a content.
        this.textForceDisplay = false;

        super.enableViewMode();
        if (!this.parent.readOnly) {
            this.$element.find('text').off('click').on('click', this.handleClickEvent);
        }
    }

    disableViewMode() {
        super.disableViewMode();
        this.$element.find('text').off('click', this.handleClickEvent);
    }

}

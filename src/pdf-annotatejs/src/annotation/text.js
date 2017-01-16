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


/**
 * Text Annotation.
 */
export default class TextAnnotation extends AbstractAnnotation {

    constructor(parent) {
        super();
        this.type     = 'textbox';
        this.parent   = parent;     // TODO Avoid cycle reference.
        this.x        = 0;
        this.y        = 0;
        this.$element = $('<div class="dummy"/>');

        // parent.on('hoverin', this.handleParentHoverIn);
        // parent.on('hoverout', this.handleParentHoverOut);
    }

    render() {
        if (this.parent.text) {
            assign(this, this.parent.getTextPosition());
            this.text = this.parent.text;
            this.$element.remove();
            this.$element = $(appendChild(getSVGLayer(), this));    
            this.setHoverEvent();        
        }
    }

    setHoverEvent() {
        this.$element.find('text').hover(
            this.handleHoverInEvent, 
            this.handleHoverOutEvent
        );
    }

    destroy() {
        this.$element.remove();
    }

    deleteSelectedAnnotation() {
        if (this.$element.find('rect').hasClass('--selected')) {
            this.destroy();
            this.emit('textchanged', null);            
        }
    }

    highlight() {
        this.$element.addClass('--hover');
        this.$element.addClass('--emphasis');
    }

    dehighlight() {
        this.$element.removeClass('--hover');
        this.$element.removeClass('--emphasis');
    }

    handleParentHoverIn() {
        this.highlight();
    }

    handleParentHoverOut() {
        this.dehighlight();
        // this.$element.removeClass('--hover');
        // // if (window.viewMode) {
        // //     this.$element.css('opacity', 0.5);
        // // }
        // this.$element.removeClass('--emphasis');
    }

    handleHoverInEvent() {
        this.$element.addClass('--hover');
        this.$element.addClass('--emphasis');
        // if (window.viewMode) {
        //     this.$element.css('opacity', 1);
        // }
        this.emit('hoverin');
    }

    handleHoverOutEvent() {
        this.$element.removeClass('--hover');
        this.$element.removeClass('--emphasis');
        // if (window.viewMode) {
        //     this.$element.css('opacity', 0.5);
        // }
        this.emit('hoverout');
    }

    handleClickEvent() {
        console.log('handleClickEvent');
        this.$element.find('rect').toggleClass('--selected');

        // Check double click.
        let currentTime = (new Date()).getTime();
        if (this.prevClickTime && (currentTime - this.prevClickTime) < 400) {
            this.handleDoubleClickEvent();
        }
        this.prevClickTime = currentTime;
    }

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
                // TODO Refactoring.
                this.enableViewMode(); // TODO 大丈夫？
                this.emit('textchanged', text);
            }

            this.render();

            enableViewMode(); // TODO Refactoring.

        }, 'text');



    }

    enableViewMode() {

        // this.$element.find('text').hover(
        //     this.handleHoverInEvent, 
        //     this.handleHoverOutEvent
        // );

        if (!this.parent.readOnly) {
            this.$element.find('text').off('click').on('click', this.handleClickEvent);
        }

    }

    disableViewMode() {

        // this.$element.find('text').off('mouseenter mouseleave');
        this.$element.find('text').off('click', this.handleClickEvent);
    }

}

// TODO
// opacity 0.5のCSS対応

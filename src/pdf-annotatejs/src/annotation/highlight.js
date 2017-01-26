import uuid from '../utils/uuid';
import AbstractAnnotation from './abstract';
import TextAnnotation from './text';

/**
 * Highlight Annotation.
 */
export default class HighlightAnnotation extends AbstractAnnotation {

    /**
     * Constructor.
     */
    constructor() {
        super();

        this.uuid       = null;
        this.type       = 'highlight';
        this.rectangles = [];
        this.text       = null;
        this.color      = null;
        this.readOnly   = false;
        this.$element   = this.createDummyElement();

        window.globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation);
        window.globalEvent.on('enableViewMode', this.enableViewMode);
        window.globalEvent.on('disableViewMode', this.disableViewMode);

        this.textAnnotation = new TextAnnotation(this);
        this.textAnnotation.on('hoverin', this.handleTextHoverIn);
        this.textAnnotation.on('hoverout', this.handleTextHoverOut);
        this.textAnnotation.on('textchanged', this.handleTextChanged);
    }

    /**
     * Create an instance from an annotation data.
     */
    static newInstance(annotation) {
        let a        = new HighlightAnnotation();
        a.uuid       = annotation.uuid || uuid();
        a.rectangles = annotation.rectangles;
        a.text       = annotation.text;
        a.color      = annotation.color;
        a.readOnly   = annotation.readOnly || false;
        return a;
    }

    /**
     * Set a hover event.
     */
    setHoverEvent() {
        this.$element.find('circle').hover(
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
    }

    /**
     * Create an annotation data for save.
     */
    createAnnotation() {
        return {
            uuid       : this.uuid,
            type       : this.type,
            rectangles : this.rectangles,
            text       : this.text,
            color      : this.color,
            readyOnly  : this.readOnly
        };
    }

    /**
     * Get the position for text.
     */
    getTextPosition() {

        let p = null;

        if (this.rectangles.length > 0) {
            p = {
                x : this.rectangles[0].x + 7,
                y : this.rectangles[0].y - 20
            };
        }

        return p;
    }

    /**
     * Delete the annotation if selected.
     */
    deleteSelectedAnnotation() {
        super.deleteSelectedAnnotation();
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
     * Show the boundingCircle.
     */
    showBoundingCircle() {
        this.$element.find('circle').removeClass('--hide');
    }

    /**
     * Hide the boundingCircle.
     */
    hideBoundingCircle() {
        this.$element.find('circle').addClass('--hide');
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
        this.text = newText;
        this.save();
    }

    /**
     * Handle a hoverin event.
     */
    handleHoverInEvent(e) {
        this.highlight();
        this.emit('hoverin');
        this.emit('circlehoverin', this);
    }

    /**
     * Handle a hoverout event.
     */
    handleHoverOutEvent(e) {
        this.dehighlight();
        this.emit('hoverout');
        this.emit('circlehoverout', this);
    }

    /**
     * Handle a click event.
     */
    handleClickEvent() {
        this.$element.toggleClass('--selected');
    }

    /**
     * Enable view mode.
     */
    enableViewMode() {

        this.disableViewMode();

        if (!this.readOnly) {
            this.$element.find('circle').on('click', this.handleClickEvent);
        }
    }

    /**
     * Disable view mode.
     */
    disableViewMode() {
        this.$element.find('circle').off('click');
    }
}

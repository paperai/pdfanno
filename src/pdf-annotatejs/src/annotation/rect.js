import appendChild from '../render/appendChild';
import { getSVGLayer } from '../UI/utils';

/**
 * Rect Annotation.
 */
export default class RectAnnotation {

    constructor() {
        this.uuid     = null;
        this.type     = 'area';
        this.x        = 0;
        this.y        = 0;
        this.width    = 0;
        this.height   = 0;
        this.text     = 0;
        this.color    = null;
        this.$element = null;

        this.hovering = false;
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
         this.$element = $(appendChild(getSVGLayer(), this));
         console.log('render:', this.$element);
    }

    handleHoverInEvent() {
        console.log('hoverin');
        // TODO
    }

    handleHoverOutEvent() {
        console.log('hoverout');
        // TODO
    }

    enableHoverEvent() {
        // TODO

        this.hovering = true;

        if (this.$element) {
            this.$element.find('rect, text').hover(
                this.handleHoverInEvent.bind(this), 
                this.handleHoverOutEvent.bind(this)
            );
        }

        // TODO ここから.
    }

    disableHoverEvent() {
        // TODO
    }




}
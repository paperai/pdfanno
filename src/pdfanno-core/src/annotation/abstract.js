import EventEmitter from 'events';
import appendChild from '../render/appendChild';
import PDFAnnoCore from '../PDFAnnoCore';
import { getSVGLayer, getMetadata } from '../UI/utils';

/**
 * Abstract Annotation Class.
 */
export default class AbstractAnnotation extends EventEmitter {

    /**
     * Constructor.
     */
    constructor() {
      super();
      this.autoBind();
    }

    /**
     * Bind the `this` scope of instance methods to `this`.
     */
    autoBind() {
      Object.getOwnPropertyNames(this.constructor.prototype)
        .filter(prop => typeof this[prop] === 'function')
        .forEach(method => {
          this[method] = this[method].bind(this);
        });
    }

    /**
     * Render annotation(s).
     */
    render() {
         this.$element.remove();
         this.$element = $(appendChild(getSVGLayer(), this));
         this.setHoverEvent && this.setHoverEvent();
         this.textAnnotation && this.textAnnotation.render();
         if (window.viewMode) {
          this.$element.addClass('--viewMode');
         }
    }

    /**
     * Save the annotation data.
     */
    save() {
        let { documentId } = getMetadata();
        PDFAnnoCore.getStoreAdapter().getAnnotation(documentId, this.uuid).then(a => {
            if (a) {
                // update.
                a = this.createAnnotation(a);
                // console.log('save:update:', a);
                PDFAnnoCore.getStoreAdapter().editAnnotation(documentId, this.uuid, a);
            } else {
                // insert.
                a = this.createAnnotation();
                PDFAnnoCore.getStoreAdapter().addAnnotation(documentId, a);
                // console.log('save:insert:', a);
            }
        });
        window.annotationContainer.add(this);
    }

    /**
     * Delete the annotation from rendering, a container in window, and a container in localStorage.
     */
    destroy() {
        this.$element.remove();
        window.annotationContainer.remove(this);
        let { documentId } = getMetadata(); // TODO Remove this.
        PDFAnnoCore.getStoreAdapter().deleteAnnotation(documentId, this.uuid).then(() => {
            console.log('deleted');
        });
        this.textAnnotation && this.textAnnotation.destroy();
    }

    /**
     * Highlight the annotation.
     */
    highlight() {
        this.$element.addClass('--hover --emphasis');
        this.textAnnotation && this.textAnnotation.highlight();
    }

    /**
     * Dehighlight the annotations.
     */
    dehighlight() {
        this.$element.removeClass('--hover --emphasis');
        this.textAnnotation && this.textAnnotation.dehighlight();
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
     * Delete the annotation if selected.
     */
    deleteSelectedAnnotation() {
        if (this.isSelected()) {
            this.destroy();
        }
    }

    /**
     * Check whether a boundingCircle is included.
     */
    hasBoundingCircle() {
        return this.$element.find('circle').length > 0;
    }

    /**
     * Check whether the annotation is selected.
     */
    isSelected() {
        return this.$element.hasClass('--selected');
    }

    /**
     * Create a dummy DOM element for the timing that a annotation hasn't be specified yet.
     */
    createDummyElement() {
        return $('<div class="dummy"/>');
    }
}

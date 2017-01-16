import assign from 'deep-assign';
import appendChild from '../render/appendChild';
import uuid from '../utils/uuid';
import { getSVGLayer } from '../UI/utils';
import { addInputField } from '../UI/text';
import { enableViewMode, disableViewMode } from '../UI/view';
import AbstractAnnotation from './abstract';
import TextAnnotation from './text';
import PDFJSAnnotate from '../PDFJSAnnotate';
import { getRelationTextPosition } from '../utils/relation.js';
import {
    scaleUp,
    scaleDown,
    getMetadata,
    disableUserSelect,
    enableUserSelect
} from '../UI/utils';

/**
 * Arrow Annotation (one-way / two-way / link)
 */
export default class ArrowAnnotation extends AbstractAnnotation {

    constructor() {
        super();
        this.uuid  = uuid();
        this.type  = 'arrow';
        this.rel1Annotation = null;
        this.rel2Annotation = null;
        this.text = null;
        this.color = null;
        this.readOnly = false;
        this.$element = $('<div class="dummy"/>');

        // for render.
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;

        this.textAnnotation = new TextAnnotation(this);
        this.textAnnotation.on('hoverin', this.handleTextHoverIn);
        this.textAnnotation.on('hoverout', this.handleTextHoverOut);
        this.textAnnotation.on('textchanged', this.handleTextChanged);
    }

    static newInstance(annotation) {
        let a            = new ArrowAnnotation();
        a.uuid           = annotation.uuid || uuid();
        a.direction      = annotation.direction;
        a.rel1Annotation = window.annotationContainer.findById(annotation.rel1);
        a.rel2Annotation = window.annotationContainer.findById(annotation.rel2);
        a.text           = annotation.text;
        a.color          = annotation.color;
        a.readOnly       = annotation.readOnly;

        return a;
    }

    render() {

        // Set start/end positions.
        if (this.rel1Annotation) {
            let p = this.rel1Annotation.getBoundingCirclePosition();
            this.x1 = p.x;
            this.y1 = p.y;
        }
        if (this.rel2Annotation) {
            let p = this.rel2Annotation.getBoundingCirclePosition();
            this.x2 = p.x;
            this.y2 = p.y;
        }

        // console.log('render:', this);

        // if (this.rel1Annotation && this.rel2Annotation) {
        //     assign(this, _getStartEndPoint(this));            
        
        // } else {
        //     // Here used at UI/arrow.js for tmp rendering.
        // }

        this.$element.remove();
        this.$element = $(appendChild(getSVGLayer(), this));
        this.textAnnotation.render();

        // console.log('render:', this.$element);
    }

    destroy() {
        this.$element.remove();
        window.annotationContainer.remove(this);
        let { documentId } = getMetadata(); // TODO Remove this.
        PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, this.uuid).then(() => {
            console.log('deleted');
        });
        this.textAnnotation.destroy();
    }

    createAnnotation() {
        return {
            uuid           : this.uuid,
            type           : this.type,
            direction      : this.direction,
            rel1 : this.rel1Annotation.uuid,
            rel2 : this.rel2Annotation.uuid,
            text           : this.text,
            color          : this.color,
            readOnly       : this.readOnly
        };
    }

    save() {
        // TODO Competible to insert and update.
        let { documentId } = getMetadata();
        PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, this.uuid).then(a => {
            if (a) {
                // update.
                a = this.createAnnotation(a);
                console.log('save:update:', a);
                PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, this.uuid, a);
            } else {
                // insert.
                a = this.createAnnotation();
                PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, 1, a);
                console.log('save:insert:', a);
            }
        });
        window.annotationContainer.add(this);
    }

    deleteSelectedAnnotation() {
        // TODO this will be better using eventEmitter on global?
        if (this.$element.find('path').hasClass('--selected')) {
            this.destroy();
        }
        this.textAnnotation.deleteSelectedAnnotation();
    }

    // arrow選択時のrel1,2のhover処理

    // rel1,2削除時のarrowとtextの削除処理

    getTextPosition() {
        let p = _getStartEndPoint(this);
        return getRelationTextPosition(null, p.x1, p.y1, p.x2, p.y2);
    }

    handleTextHoverIn() {
        // TODO Refactoring CSS.
        this.$element.find('path').addClass('--hover');
        this.$element.addClass('--emphasis');
        // if (window.viewMode) {
        //     this.$element.css('opacity', 1);
        // }
    }

    handleTextHoverOut() {
        this.$element.find('path').removeClass('--hover');
        this.$element.removeClass('--emphasis');
        // if (window.viewMode) {
        //     this.$element.css('opacity', 0.5);
        // }
    }

    handleTextChanged(textAfter) {
        this.text = textAfter;
        this.save();
    }

    handleHoverInEvent() {
        this.$element.find('path').addClass('--hover');
        this.$element.addClass('--emphasis');
        // // TODO Refactoring.
        // if (window.viewMode) {
        //     this.$element.css('opacity', 1);
        // }
        this.emit('hoverin');
    }

    handleHoverOutEvent() {
        this.$element.find('path').removeClass('--hover');
        this.$element.removeClass('--emphasis');
        // // TODO Refactoring.
        // if (window.viewMode) {
        //     this.$element.css('opacity', 0.5);
        // }
        this.emit('hoverout');
    }    

    handleClickEvent() {
        this.$element.find('path').toggleClass('--selected');
    }

    enableViewMode() {

        this.$element.find('path').off();
        this.$element.find('path').hover(
            this.handleHoverInEvent,
            this.handleHoverOutEvent
        );
        this.textAnnotation.enableViewMode();

        if (!this.readOnly) {
            this.$element.find('path').on('click', this.handleClickEvent);
        }
    }

    disableViewMode() {
        this.$element.find('path').off('mouseenter mouseleave');
        this.$element.find('path').off('click', this.handleClickEvent);
        this.textAnnotation.disableViewMode();
    }    
}

function _getStartEndPoint(arrowAnnotation) {
    // set the start/end position.
    let p1 = arrowAnnotation.rel1Annotation.getBoundingCirclePosition();
    let p2 = arrowAnnotation.rel2Annotation.getBoundingCirclePosition();
    return {
        x1 : p1.x,
        y1 : p1.y,
        x2 : p2.x,
        y2 : p2.y        
    };
}

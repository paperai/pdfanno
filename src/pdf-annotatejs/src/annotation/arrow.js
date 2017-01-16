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

        window.globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation);
        window.globalEvent.on('enableViewMode', this.enableViewMode);
        window.globalEvent.on('disableViewMode', this.disableViewMode);

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
        a.readOnly       = annotation.readOnly || false;

        return a;
    }

    set rel1Annotation(a) {
        console.log('setRel1Annotation:', a);
        this._rel1Annotation = a;
        if (this._rel1Annotation) {
            this._rel1Annotation.on('hoverin', this.handleRelHoverIn);
            this._rel1Annotation.on('hoverout', this.handleRelHoverOut);
            this._rel1Annotation.on('rectmove', this.handleRelMove);
            this._rel1Annotation.on('delete', this.handleRelDelete);
        }
    }

    get rel1Annotation() {
        return this._rel1Annotation;
    }

    set rel2Annotation(a) {
        console.log('setRel2Annotation');
        this._rel2Annotation = a;
        if (this._rel2Annotation) {
            this._rel2Annotation.on('hoverin', this.handleRelHoverIn);
            this._rel2Annotation.on('hoverout', this.handleRelHoverOut);            
            this._rel2Annotation.on('rectmove', this.handleRelMove);
            this._rel2Annotation.on('delete', this.handleRelDelete);
        }
    }

    get rel2Annotation() {
        return this._rel2Annotation;
    }

    render() {

        // Set start/end positions.
        if (this._rel1Annotation) {
            let p = this._rel1Annotation.getBoundingCirclePosition();
            this.x1 = p.x;
            this.y1 = p.y;
        }
        if (this._rel2Annotation) {
            let p = this._rel2Annotation.getBoundingCirclePosition();
            this.x2 = p.x;
            this.y2 = p.y;
        }

        super.render();

        // console.log('render:', this);

        // if (this.rel1Annotation && this.rel2Annotation) {
        //     assign(this, _getStartEndPoint(this));            
        
        // } else {
        //     // Here used at UI/arrow.js for tmp rendering.
        // }

        // this.$element.remove();
        // this.$element = $(appendChild(getSVGLayer(), this));
        // this.textAnnotation.render();

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
            rel1 : this._rel1Annotation.uuid,
            rel2 : this._rel2Annotation.uuid,
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

    highlightRelAnnotations() {
        if (this._rel1Annotation) {
            this._rel1Annotation.highlight();
        }
        if (this._rel2Annotation) {
            this._rel2Annotation.highlight();
        }
    }

    dehighlightRelAnnotations() {
        if (this._rel1Annotation) {
            this._rel1Annotation.dehighlight();
        }
        if (this.rel2Annotation) {
            this.rel2Annotation.dehighlight();
        }
    }

    highlight() {
        // TODO Refactoring CSS.
        this.$element.find('path').addClass('--hover');
        this.$element.addClass('--emphasis');
        this.textAnnotation.highlight();
    }

    dehighlight() {
        this.$element.find('path').removeClass('--hover');
        this.$element.removeClass('--emphasis');
        this.textAnnotation.dehighlight();
    }

    handleTextHoverIn() {
        this.highlight();
        this.emit('hoverin');
        this.highlightRelAnnotations();
    }

    handleTextHoverOut() {
        this.dehighlight();
        this.emit('hoverout');
        this.dehighlightRelAnnotations();
    }

    handleRelHoverIn() {
        this.highlight();
        // this.$element.find('path').addClass('--hover');
        // this.$element.addClass('--emphasis');
        this.highlightRelAnnotations();
        // this.emit('hoverin');
    }

    handleRelHoverOut() {
        this.dehighlight();
        // this.$element.find('path').removeClass('--hover');
        // this.$element.removeClass('--emphasis');
        this.dehighlightRelAnnotations();
        // this.emit('hoverout');
    }

    handleRelDelete() {
        this.destroy();
    }

    handleRelMove() {
        this.render();
    }

    handleTextChanged(textAfter) {
        this.text = textAfter;
        this.save();
    }

    handleHoverInEvent() {
        this.highlight();
        this.emit('hoverin');
        this.highlightRelAnnotations();
    }

    handleHoverOutEvent() {
        this.dehighlight();
        this.emit('hoverout');
        this.dehighlightRelAnnotations();
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
    let p1 = arrowAnnotation._rel1Annotation.getBoundingCirclePosition();
    let p2 = arrowAnnotation._rel2Annotation.getBoundingCirclePosition();
    return {
        x1 : p1.x,
        y1 : p1.y,
        x2 : p2.x,
        y2 : p2.y        
    };
}

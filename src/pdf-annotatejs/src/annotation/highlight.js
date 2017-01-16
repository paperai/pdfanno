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

// TODO ここから
// Hightlightの追加処理はOK（テキストの扱いが変わっているかは確認、html上とannoファイル上、テキスト表示される？）
// UI的なイベント処理はこれから実装する.

export default class HighlightAnnotation extends AbstractAnnotation {

    constructor() {
        super();
        this.uuid = null;
        this.type = 'highlight';
        this.rectangles = [];
        this.text = null;
        this.color = null;
        this.readOnly = null;
        this.$element = $('<div class="dummy"/>');

        this.textAnnotation = new TextAnnotation(this);
        this.textAnnotation.on('hoverin', this.handleTextHoverIn);
        this.textAnnotation.on('hoverout', this.handleTextHoverOut);
        this.textAnnotation.on('textchanged', this.handleTextChanged);
    }

    static newInstance(annotation) {
        let highlight      = new HighlightAnnotation();
        highlight.uuid     = annotation.uuid || uuid();;
        highlight.rectangles = annotation.rectangles;
        highlight.text     = annotation.text;
        highlight.color    = annotation.color;
        highlight.readOnly = annotation.readOnly;
        return highlight;        
    }

    render() {
         this.$element.remove();
         this.$element = $(appendChild(getSVGLayer(), this));
         this.setHoverEvent();
         this.textAnnotation.render();
    }

    setHoverEvent() {
        this.$element.find('circle').hover(
            this.handleHoverInEvent, 
            this.handleHoverOutEvent
        );
    }

    destroy() {
        this.$element.remove();
        window.annotationContainer.remove(this);
        let { documentId } = getMetadata(); // TODO Remove this.
        PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, this.uuid).then(() => {
            console.log('deleted');
        });
        this.textAnnotation.destroy();
        this.emit('delete');
    }

    createAnnotation() {
        // TODO Refactring.
        return {
            uuid   : this.uuid,
            type   : this.type,
            rectangles      : this.rectangles,
            text   : this.text,
            color  : this.color,
            readyOnly : this.readOnly
        };
    }

    save() {
        // TODO make this in abstract.
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

        if (this.$element.find('rect').hasClass('--selected')) {
            this.destroy();
        }

        this.textAnnotation.deleteSelectedAnnotation();
    }

    getTextPosition() {

        if (this.rectangles.length > 0) {

            return {
                x : this.rectangles[0].x + 7, // 7 = DEFAULT_RADIUS + 2
                y : this.rectangles[0].y - 20
            };

        } else {
            return { x : 0, y : 0 };
        }
    }

    getBoundingCirclePosition() {
        let $circle = this.$element.find('circle');
        return {
            x : parseFloat($circle.attr('cx')),
            y : parseFloat($circle.attr('cy'))
        };
    }

    showBoundingCircle() {
        this.$element.find('circle').removeClass('--hide');
    }

    hideBoundingCircle() {
        this.$element.find('circle').addClass('--hide');
    }

    highlight() {
        // TODO CSS Refactoring.
        this.$element.find('rect').addClass('--hover');
        this.$element.addClass('--emphasis');
        this.textAnnotation.highlight();
    }

    dehighlight() {
        this.$element.find('rect').removeClass('--hover');
        this.$element.removeClass('--emphasis');
        this.textAnnotation.dehighlight();
    }

    handleTextHoverIn() {
        this.highlight();
        this.emit('hoverin');
    }

    handleTextHoverOut() {
        this.dehighlight();
        this.emit('hoverout');
    }

    // handleTextChanged(textAfter) {
    //     this.text = textAfter;
    //     this.save();
    // }

    // handleHoverInEvent(e) {
    //     this.highlight();
    //     this.emit('hoverin');

    //     let $elm = $(e.currentTarget);
    //     if ($elm.prop("tagName") === 'circle') {
    //         this.emit('circlehoverin', this);
    //     }
    // }

    // handleHoverOutEvent(e) {
    //     this.dehighlight();
    //     this.emit('hoverout');

    //     let $elm = $(e.currentTarget);
    //     if ($elm.prop("tagName") === 'circle') {
    //         this.emit('circlehoverout', this);
    //     }
    // }

    // handleTextHoverIn() {
    //     // TODO Refactoring CSS.
    //     this.$element.find('rect').addClass('--hover');
    //     this.$element.addClass('--emphasis');
    //     // if (window.viewMode) {
    //     //     this.$element.css('opacity', 1);
    //     // }
    // }

    // handleTextHoverOut() {
    //     // TODO Refactoring CSS.
    //     this.$element.find('rect').removeClass('--hover');
    //     this.$element.removeClass('--emphasis');
    //     // if (window.viewMode) {
    //     //     this.$element.css('opacity', 0.5);
    //     // }
    // }

    handleTextChanged(textAfter) {
        this.text = textAfter;
        this.save();
    }

    // handleHoverInEvent(e) {
    //     this.highlight();

    //     let $elm = $(e.currentTarget);
    //     if ($elm.prop("tagName") === 'circle') {
    //         this.emit('circlehoverin', this);
    //     }
    // }

    // handleHoverOutEvent(e) {
    //     this.dehighlight();

    //     let $elm = $(e.currentTarget);
    //     if ($elm.prop("tagName") === 'circle') {
    //         this.emit('circlehoverout', this);
    //     }
    // }

    handleHoverInEvent(e) {
        this.highlight();
        this.emit('hoverin');

        let $elm = $(e.currentTarget);
        if ($elm.prop("tagName") === 'circle') {
            this.emit('circlehoverin', this);
        }
    }

    handleHoverOutEvent(e) {
        this.dehighlight();
        this.emit('hoverout');

        let $elm = $(e.currentTarget);
        if ($elm.prop("tagName") === 'circle') {
            this.emit('circlehoverout', this);
        }
    }

    handleClickEvent() {
        this.$element.find('rect').toggleClass('--selected');
    }

    enableViewMode() {

        // this.$element.find('cirle').off();
        // this.$element.find('circle').hover(
        //     this.handleHoverInEvent,
        //     this.handleHoverOutEvent
        // );
        this.textAnnotation.enableViewMode();

        if (!this.readOnly) {
            this.$element.find('circle').off('click').on('click', this.handleClickEvent);
        }


    }

    disableViewMode() {
        
        // this.$element.find('circle').off('mouseenter mouseleave');

        this.$element.find('circle').off('click', this.handleClickEvent);
        this.textAnnotation.disableViewMode();
    }

}
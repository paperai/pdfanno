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
// Hightlightの追加処理はOK（テキストの扱いが変わっているかは確認、html上とannoファイル上）
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
        this.textAnnotation.on('hovverout', this.handleTextHoverOut);
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
         this.textAnnotation.render();
    }

    destroy() {
        this.$element.remove();
        window.annotationContainer.remove(this);
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
        // // TODO Refactoring.
        // if (this.$element.find('.anno-rect').hasClass('--selected')) {
        //     this.$element.remove();
        //     let { documentId } = getMetadata();
        //     PDFJSAnnotate.getStoreAdapter().deleteAnnotation(documentId, this.uuid).then(() => {
        //         console.log('deleted');
        //     });
        //     this.textAnnotation.destroy();
        //     window.annotationContainer.remove(this);
        
        // } else if (this.$element.find('.anno-text').hasClass('--selected')) {
        //     this.text = null;
        //     this.save();
        //     this.render();
        //     this.enableViewMode();
        // }

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
    handleTextHoverIn() {
        // TODO Refactoring CSS.
        this.$element.find('rect').addClass('--hover');
        this.$element.css('opacity', 1);
    }

    handleTextHoverOut() {
        // TODO Refactoring CSS.
        this.$element.find('rect').removeClass('--hover');
        this.$element.css('opacity', 0.5);
    }

    handleTextChanged(textAfter) {
        this.text = textAfter;
        this.save();
    }


    enableViewMode() {

        // TODO BoundingCircle対応.

    }


    disableViewMode() {

        // TODO BoundingCircle対応.

    }

}
import EventEmitter from 'events';
import appendChild from '../render/appendChild';
import { getSVGLayer } from '../UI/utils';

/**
 *
 */
export default class AbstractAnnotation extends EventEmitter {

    constructor() {
      super();
      this.autoBind();
    }

    /**
     * クラスのメソッドのthisをクラスインスタンスにバインドします。
     */
    autoBind() {
      Object.getOwnPropertyNames(this.constructor.prototype)
        .filter(prop => typeof this[prop] === 'function')
        .forEach(method => {
          this[method] = this[method].bind(this);
        });
    }

    render() {
         this.$element.remove();
         this.$element = $(appendChild(getSVGLayer(), this));
         this.setHoverEvent && this.setHoverEvent();
         this.textAnnotation && this.textAnnotation.render();
         if (window.viewMode) {
          this.$element.addClass('--viewMode');
         }
    }
}
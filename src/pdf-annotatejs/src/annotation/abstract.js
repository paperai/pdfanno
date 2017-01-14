import EventEmitter from 'events';

/**
 *
 */
export default class AbstractAnnotation extends EventEmitter {
// export default class AbstractAnnotation {

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

}
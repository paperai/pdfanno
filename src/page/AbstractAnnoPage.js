/**
 * Annotation functions for Page.
 */
export default class AbstractAnnoPage {

    constructor() {

        // Auto-binding.
        this.autoBind();

        // PDFs or HTMLs.
        this.contentFiles = [];

        // AnnoFiles,
        this.annoFiles = [];

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

}

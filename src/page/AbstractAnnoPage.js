/**
 * Annotation functions for Page.
 */
// TODO インターフェースを定義する（PDFAnnoPage.jsより）.
export default class AbstractAnnoPage {

    constructor() {

        // Auto-binding.
        this.autoBind();

        // PDFs or HTMLs.
        this.contentFiles = [];

        // AnnoFiles,
        this.annoFiles = [];

        // // Selected contents.
        // this.selectedContentFile = null;

        // // Selected primaryAnno.
        // this.selectedPrimaryAnnoFile = null;

        // // Selected referenceAnnos.
        // this.selectedReferenceAnnoFils = [];
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
     * Load files(contents and annoFiles).
     *
     * @param {Array<File>} files - files user selected in a file dialog.
     * @return {Promise}
     */
    loadFiles(files) {
        // TODO Imlemented at a subClass.
    }






}

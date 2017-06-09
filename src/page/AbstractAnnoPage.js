/**
 * Annotation functions for Page.
 */
export default class AbstractAnnoPage {

    constructor() {

        // PDFs or HTMLs.
        this.contentFiles = [];

        // AnnoFiles,
        this.annoFiles = [];
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

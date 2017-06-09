import AbstractAnnoPage from '../AbstractAnnoPage';

import loadFiles from './loadFiles';

/**
 * PDFAnno's Annotation functions for Page produced by .
 */
export default class PDFAnnoPage extends AbstractAnnoPage {

    constructor() {
        super(...arguments);
    }

    /**
     * @inheritDoc.
     */
    loadFiles(files) {
        return loadFiles(files).then(result => {
            this.contentFiles = result.contents;
            this.annoFiles = result.annos;
        });
    }
}

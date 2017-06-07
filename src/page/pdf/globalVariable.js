/**
 * Global data for PDFAnnoPage.
 */
class PDFAnnoPageGlobalVariable {

    set pdfNames(pdfNames) {
        this._pdfNames = pdfNames;
    }

    get pdfNames() {
        return this._pdfNames || [];
    }

    set pdfDataMap(pdfDataMap) {
        this._pdfDataMap = pdfDataMap;
    }

    get pdfDataMap() {
        return this._pdfDataMap || [];
    }

    set annoNames(annoNames) {
        this._annoNames = annoNames;
    }

    get annoNames() {
        return this._annoNames || [];
    }

    set annoDataMap(annoDataMap) {
        this._annoDataMap = annoDataMap;
    }

    get annoDataMap() {
        return this._annoDataMap || [];
    }
}

export default new PDFAnnoPageGlobalVariable();

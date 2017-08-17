// import StoreAdapter from './adapter/StoreAdapter';
// import PdfannoStoreAdapter from './adapter/PdfannoStoreAdapter';
import render from './render';
import UI from './UI';
import RectAnnotation from './annotation/rect';
import SpanAnnotation from './annotation/span';
import RelationAnnotation from './annotation/relation';

require("!style-loader!css-loader!./css/pdfanno.css");

export default {
  /**
   * Abstract class that needs to be defined so PDFAnnoCore
   * knows how to communicate with your server.
   */
  // StoreAdapter,

  /**
    Implementation of StoreAdapter for PDFAnno.
  */
  // PdfannoStoreAdapter,

  /**
   * Abstract instance of StoreAdapter
   */
  // __storeAdapter: new StoreAdapter(),

  /**
   * Getter for the underlying StoreAdapter property
   *
   * @return {StoreAdapter}
   */
  // getStoreAdapter() {
  //   return this.__storeAdapter;
  // },

  /**
   * Setter for the underlying StoreAdapter property
   *
   * @param {StoreAdapter} adapter The StoreAdapter implementation to be used.
   */
  // setStoreAdapter(adapter) {
  //   // TODO this throws an error when bundled
  //   // if (!(adapter instanceof StoreAdapter)) {
  //   //   throw new Error('adapter must be an instance of StoreAdapter');
  //   // }

  //   this.__storeAdapter = adapter;
  // },

  /**
   * UI is a helper for instrumenting UI interactions for creating,
   * editing, and deleting annotations in the browser.
   */
  UI,

  /**
   * Render the annotations for a page in the PDF Document
   *
   * @param {SVGElement} svg The SVG element that annotations should be rendered to
   * @param {PageViewport} viewport The PDFPage.getViewport data
   * @param {Object} data The StoreAdapter.getAnnotations data
   * @return {Promise}
   */
  render,

  /**
   * Convenience method for getting annotation data
   *
   * @alias StoreAdapter.getAnnotations
   * @param {String} documentId The ID of the document
   * @return {Promise}
   */
  // getAnnotations(documentId) {
  //   return this.getStoreAdapter().getAnnotations(...arguments);
  // },

  /**
   * RectAnnotation Class.
   */
  RectAnnotation,

  /**
   * SpanAnnotation Class.
   */
  SpanAnnotation,

  /**
   * RelationAnnotation Class.
   */
  RelationAnnotation

}

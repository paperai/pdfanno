import render from './render'
import UI from './UI'
import RectAnnotation from './annotation/rect'
import SpanAnnotation from './annotation/span'
import RelationAnnotation from './annotation/relation'

require('!style-loader!css-loader!./css/pdfanno.css')

export default {

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

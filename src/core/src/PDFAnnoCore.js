import render from './render'
import UI from './UI'
import RectAnnotation from './annotation/rect'
import SpanAnnotation from './annotation/span'
import RelationAnnotation from './annotation/relation'

export default {

    /**
     * UI is a helper for instrumenting UI interactions for creating,
     * editing, and deleting annotations in the browser.
     */
    UI,

    /**
     * Render the annotations for a page in the PDF Document
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

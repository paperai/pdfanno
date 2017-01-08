/**
 * Annotation Container.
 */
export default class AnnotationContainer {

    constructor() {
        this.list = [];
    }

    add(annotation) {
        this.list.push(annotation);
    }

    remove(annotation) {
        // TODO
    }

    getAllAnnotations() {
        return this.list;
    }
}
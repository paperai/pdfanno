/**
 * Annotation Container.
 */
export default class AnnotationContainer {

    /**
     * Constructor.
     */
    constructor() {
        this.set = new Set();
    }

    /**
     * Add an annotation to the container.
     */
    add(annotation) {
        this.set.add(annotation);
    }

    /**
     * Remove the annotation from the container.
     */
    remove(annotation) {
        this.set.delete(annotation);
    }

    /**
     * Get all annotations from the container.
     */
    getAllAnnotations() {
        let list = [];
        this.set.forEach(a => list.push(a));
        return list;
    }

    /**
     * Find an annotation by the id which an annotation has.
     */
    findById(uuid) {
        let annotation = null;
        this.set.forEach(a => {
            if (a.uuid === uuid) {
                annotation = a;
            }
        });
        return annotation;
    }
}

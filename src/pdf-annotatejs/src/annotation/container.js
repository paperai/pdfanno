/**
 * Annotation Container.
 */
export default class AnnotationContainer {

    constructor() {
        this.set = new Set();
    }

    add(annotation) {
        this.set.add(annotation);
    }

    remove(annotation) {
        this.set.delete(annotation);
    }

    getAllAnnotations() {
        let list = [];
        this.set.forEach(a => list.push(a));
        return list;
    }

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
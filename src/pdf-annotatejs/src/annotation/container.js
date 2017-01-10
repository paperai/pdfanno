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
        let newList = [];
        this.list.forEach(a => {
            if (annotation !== a) {
                newList.push(a);
            }
        });
        this.list = newList;
    }

    getAllAnnotations() {
        return this.list;
    }
}
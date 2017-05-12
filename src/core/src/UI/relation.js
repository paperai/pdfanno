import $ from 'jquery';

import * as textInput from '../utils/textInput';

import RelationAnnotation from '../annotation/relation';

/**
 * Create a new Relation annotation.
 */
export function createRelation(type, anno1, anno2, dryRun=false) {

    let annotation = new RelationAnnotation();
    annotation.direction = type;
    annotation.rel1Annotation = anno1;
    annotation.rel2Annotation = anno2;

    if (dryRun === false) {
        annotation.save();
        annotation.render();

        // TODO Refactoring.
        // Deselect all.
        window.annotationContainer
            .getSelectedAnnotations()
            .forEach(a => a.deselect());

        // Select.
        annotation.select();

        // New type text.
        textInput.enable({ uuid : annotation.uuid, autoFocus : true });
    }

    return annotation;
}

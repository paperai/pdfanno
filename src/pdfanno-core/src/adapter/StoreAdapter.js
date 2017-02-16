import abstractFunction from '../utils/abstractFunction';

// Adapter should never be invoked publicly
export default class StoreAdapter {
  /**
   * Create a new StoreAdapter instance
   *
   * @param {Object} [definition] The definition to use for overriding abstract methods
   */
  constructor(definition = {}) {
    // Copy each function from definition if it is a function we know about
    Object.keys(definition).forEach((key) => {
      if (typeof definition[key] === 'function' &&
          typeof this[key] === 'function') {
        this[key] = definition[key];
      }
    });
  }

  /**
   * Get all the annotations for a given document and page number.
   *
   * @param {String} documentId The ID for the document the annotations belong to
   * @return {Promise}
   */
  __getAnnotations(documentId) { abstractFunction('getAnnotations'); }
  get getAnnotations() { return this.__getAnnotations; }
  set getAnnotations(fn) {
    this.__getAnnotations = function getAnnotations(documentId) {
      return fn(...arguments).then((annotations) => {
        if (annotations.annotations) {
          annotations.annotations.forEach((a) => {
            a.documentId = documentId;
          });
        }
        return annotations;
      });
    };
  }

  __getSecondaryAnnotations(documentId) { abstractFunction('getSecondaryAnnotations'); }
  get getSecondaryAnnotations() { return this.__getSecondaryAnnotations; }
  set getSecondaryAnnotations(fn) {
    this.__getSecondaryAnnotations = function getSecondaryAnnotations(documentId) {
      return fn(...arguments).then((annotations) => {
        if (annotations.annotations) {
          annotations.annotations.forEach((a) => {
            a.documentId = documentId;
          });
        }
        return annotations;
      });
    };
  }

  /**
   * Get the definition for a specific annotation.
   *
   * @param {String} documentId The ID for the document the annotation belongs to
   * @param {String} annotationId The ID for the annotation
   * @return {Promise}
   */
  getAnnotation(documentId, annotationId) { abstractFunction('getAnnotation'); }

  /**
   * Add an annotation
   *
   * @param {String} documentId The ID for the document to add the annotation to
   * @param {String} pageNumber The page number to add the annotation to
   * @param {Object} annotation The definition for the new annotation
   * @return {Promise}
   */
  __addAnnotation(documentId, annotation) { abstractFunction('addAnnotation'); }
  get addAnnotation() { return this.__addAnnotation; }
  set addAnnotation(fn) {
    this.__addAnnotation = function addAnnotation(documentId, annotation) {
      return fn(...arguments).then((annotation) => {
        return annotation;
      });
    };
  }

  /**
   * Edit an annotation
   *
   * @param {String} documentId The ID for the document
   * @param {String} pageNumber the page number of the annotation
   * @param {Object} annotation The definition of the modified annotation
   * @return {Promise}
   */
  __editAnnotation(documentId, pageNumber, annotation) { abstractFunction('editAnnotation'); }
  get editAnnotation() { return this.__editAnnotation; }
  set editAnnotation(fn) {
    this.__editAnnotation = function editAnnotation(documentId, annotationId, annotation) {
      return fn(...arguments).then((annotation) => {
        return annotation;
      });
    };
  }

  /**
   * Delete an annotation
   *
   * @param {String} documentId The ID for the document
   * @param {String} annotationId The ID for the annotation
   * @return {Promise}
   */
  __deleteAnnotation(documentId, annotationId) { abstractFunction('deleteAnnotation'); }
  get deleteAnnotation() { return this.__deleteAnnotation; }
  set deleteAnnotation(fn) {
    this.__deleteAnnotation = function deleteAnnotation(documentId, annotationId) {
      return fn(...arguments);
    };
  }

  /**
   * Delete all annotations.
   *
   * @param {String} documentId - the ID for the document.
   * @return {Promise}
   */
  __deleteAnnotations(documentId) { abstractFunction('deleteAnnotations'); }
  get deleteAnnotations() { return this.__deleteAnnotations; }
  set deleteAnnotations(fn) {
    this.__deleteAnnotations = function deleteAnnotations(documentId) {
      return fn(...arguments);
    };
  }

  /**
   * Export annotation data.
   *
   * @return {Promise}
   */
  __exportData() { abstractFunction('exportData'); }
  get exportData() { return this.__exportData; }
  set exportData(fn) {
    this.__exportData = function exportData() {
      return fn(...arguments);
    }
  }

  /**
   * Import annotation data from a JSON data.
   *
   * @param {Object} data - the data for import formatted as json.
   */
  __importAnnotations(data, isPrimary) { abstractFunction('importAnnotations'); }
  get importAnnotations() { return this.__importAnnotations; }
  set importAnnotations(fn) {
    this.__importAnnotations = function importAnnotations(json, isPrimary) {
      return fn(...arguments);
    }
  }

  /**
   * Find annotations.
   *
   * @param {String} documentId - the ID for the document.
   * @param {Object} criteria - the search condition.
   */
  __findAnnotations(documentId, criteria) { abstractFunction('findAnnotations'); }
  get findAnnotations() { return this.__findAnnotations; }
  set findAnnotations(fn) {
    this.__findAnnotations = function findAnnotations(documentId, criteria) {
      return fn(...arguments).then((annotations) => {
        // TODO may be best to have this happen on the server
        if (annotations.annotations) {
          annotations.annotations.forEach((a) => {
            a.documentId = documentId;
          });
        }
        return annotations;
      });
    };
  }

}

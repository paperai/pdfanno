/**
 * Generate a universally unique identifier
 *
 * @return {String}
 */
export default function uuid () {
    const maxId = window.annotationContainer.getAllAnnotations().reduce((val, a) => {
        return Math.max(val, parseInt(a.uuid))
    }, 0)
    return String(maxId + 1)
}

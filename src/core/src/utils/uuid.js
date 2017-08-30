/**
 * Generate a univierally unique identifier
 *
 * @return {String}
 */
export default function uuid () {

    let uid = 0
    window.annotationContainer.getAllAnnotations().forEach(a => {
        uid = Math.max(uid, parseInt(a.uuid))
    })
    return String(uid + 1)
}

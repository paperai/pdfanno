/**
    APIs for external servers.
*/
const service = require('../service')

// sample.
module.exports.getUserAnnotation = (req, res) => {

    res.set('Content-Type', 'text/plain')

    const documentId = req.params.documentId
    const userId = req.query.user_id

    if (!documentId || !userId) {
        res.send(400, 'DocumentId and userId are required.')
        return
    }

    const annotation = service.getUserAnnotation(documentId, userId)
    if (!annotation) {
        res.send(404, 'Annotation file is not found.')
        return
    }

    res.send(annotation)
}

const service = require('../service')


// Reference: API document with Deep Scholar.
//  https://github.com/paperai/paperanno-ja/blob/master/with-deepscholar.md

/**
 * Get resources from DeepScholar.
 *
 * @param req request object of express4.
 * @param res response object of express4.
 */
module.exports.get = async (req, res) => {

  // Get conditions from the request.
  const deepScholar = {
    apiRoot    : req.query.api_root,
    documentId : req.param('documentId'),
    token : req.query.token
  }

  // Check is valid.
  if (!deepScholar.apiRoot) {

    return res.status(400).json({ message : 'api_root is required.' })

  } else if (!deepScholar.documentId) {

    return res.status(400).json({ message : 'documentId is required.' })
  }

  // Call APIs.
  try {

    // Get document information.
    const docInfo = await service.deepscholarService.getDocumentInformation(deepScholar)
    if (!docInfo) {
      return res.status(400).json({ message : 'DeepScholar returned empty document information.' })
    }

    console.log('docInfo:', docInfo)

    // Get a PDF file.
    const pdf = await service.fetchPDF(docInfo.pdf)

    // Get a pdftxt.
    // TODO docInfo has `pdftxt` url, but it's not correct, so ignore it.
    const pdftxt = await service.createPdftxt(pdf)

    // Get annotations.
    let annotations = []
    if (deepScholar.token) {
      annotations = await service.deepscholarService.getAnnotations(deepScholar)
    }

    return res.json({
      pdf : new Buffer(pdf).toString('base64'),
      pdftxt,
      annotations
    })

  } catch (e) {
    console.log('internal_deepscholar:get:Server Error.', e)
    return res.status(500).json({ message : 'Server Error.' })
  }

}

// TODO Implements.
module.exports.upload = (req, res) => {

  const token = req.query.token
  const body = req.body

  if (!token) {
    return res.status(401).json({
      message : 'user_token is required.'
    })
  } else if (!body.user || !body.user.id || !body.anno) {
    return res.status(400).json({
      message : 'POST data is invalid.',
      data : body
    })
  }

  // TODO Send an upload request to Deep Scholar, and treat the response.

  res.json({ message : 'ok' })
}

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
    token : req.query.token || req.query.user_token
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
      try {
        annotations = await service.deepscholarService.getAnnotations(deepScholar)
      } catch (e) {
        // e.g. token is invalid.
        console.log('ERROR:', e)
      }
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

/**
 * Upload annotations to DeepScholar.
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.upload = async (req, res) => {

  const documentId = req.params['documentId']
  const apiRoot = req.body['api_root']
  const token = req.body['token']
  const anno = req.body['anno']

  if (!apiRoot || !documentId || !token || anno == null) {
    console.log('body is invalid.', apiRoot, documentId, token, anno)
    return res.status(401).json({ message : 'request body is invalid.' })
  }

  try {
    await service.deepscholarService.upload({ apiRoot, documentId, token, anno })
    return res.json({ message : 'ok' })

  } catch (e) {
    if (e.statusCode === 401) {
      return res.status(401).json({ message : 'Authentication error.' })
    }
    if (e.statusCode === 404) {
      return res.status(404).json({ message : 'Document not found.' })
    }
    console.log('error:', e)
    return res.status(500).json({ message : 'Server error.' })
  }

}

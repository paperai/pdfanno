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

  const logs = [ 'api starts. ' ]

  // Get conditions from the request.
  const deepScholar = {
    apiRoot    : req.query.api_root,
    documentId : req.param('documentId'),
    token      : req.query.token || req.query.user_token
  }

  // Check is valid.
  if (!deepScholar.apiRoot) {
    logs.push('api_root is required.')
    return res.status(400).json({ message : 'api_root is required.', logs })
  } else if (!deepScholar.documentId) {
    logs.push('documentId is required.')
    return res.status(400).json({ message : 'documentId is required.', logs })
  }

  // Call APIs.
  try {

    // Get document information.
    const docInfo = await service.deepscholarService.getDocumentInformation(deepScholar)
    if (!docInfo) {
      return res.status(400).json({ message : 'DeepScholar returned empty document information.' })
    }
    logs.push('got document info from DeepScholar.')

    console.log('docInfo:', docInfo)

    // Get a PDF file.
    const pdf = await service.fetchPDF(docInfo.pdf)
    logs.push(`got a PDF from ${docInfo.pdf}.`)

    // Get a pdftxt.
    // TODO docInfo has `pdftxt` url, but it's not correct, so ignore it.
    let pdftxt = service.loadCachePdftxt(pdf)
    if (!pdftxt) {
      pdftxt = await service.createPdftxt(pdf)
      service.savePdftxt(pdf, pdftxt)
    }
    logs.push(`got a pdftxt from PDFExtractor.`)

    // Get annotations.
    let annotations = []
    if (deepScholar.token) {
      try {
        annotations = await service.deepscholarService.getAnnotations(deepScholar)
        logs.push(`got annotations from PDFExtractor.`)
      } catch (e) {
        // e.g. token is invalid.
        console.log('ERROR:', e)
        logs.push(`failed to get annotations from PDFExtractor. reason: ${e}`)
      }
    }

    logs.push('api finished.')

    return res.json({
      pdf : new Buffer(pdf).toString('base64'),
      pdftxt,
      annotations,
      logs
    })

  } catch (e) {
    logs.push(`something happened. reason: ${e}`)
    console.log('internal_deepscholar:get:Server Error.', e)
    return res.status(500).json({ message : 'Server Error.', logs })
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

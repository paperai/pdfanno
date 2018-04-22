const request = require('request')
const service = require('../service')

// Reference: API document with Deep Scholar.
//  https://github.com/paperai/paperanno-ja/blob/master/with-deepscholar.md

/**
 * Get resources to display from DeepScholar.
 *
 * @param req request object of express4.
 * @param res response object of express4.
 */
module.exports.get = async (req, res) => {

  const deepScholar = {
    apiRoot    : req.query.api_root,
    documentId : req.param('documentId'),
    user       : {
      id    : req.query.user_id,
      token : req.query.user_token
    }
  }

  if (!deepScholar.apiRoot) {
    return res.status(400).json({ message : 'api_root is required.' })
  } else if (!deepScholar.documentId) {
    return res.status(400).json({ message : 'documentId is required.' })
  } else if (!deepScholar.user.id) {
    return res.status(400).json({ message : 'user_id is required.' })
  } else if (!deepScholar.user.token) {
    return res.status(400).json({ message : 'user_token is required.' })
  }

  // TODO this is a mock implementation.
  // For real, get a pdf from Deep Scholar.
  const pdf = await service.fetchPDF('https://www.yoheim.net/tmp/bitcoin.pdf')

  // TODO this is a mock implementation.
  // For real, get a pdftxt from Deep Scholar.
  const pdftxt = await service.createPdftxt(pdf)

  // TODO this is a mock implementation.
  // For real, get annotations from Deep Scholar.
  const annotations = [
    {
      user : { id : 'user1', name : 'USER1' },
      anno : await fetchAnnotation('https://www.yoheim.net/tmp/bitcoin_1.anno')
    },
    {
      user : { id : 'user2', name : 'USER2' },
      anno : await fetchAnnotation('https://www.yoheim.net/tmp/bitcoin_2.anno')
    },
    {
      user : { id : 'user3', name : 'USER3' },
      anno : await fetchAnnotation('https://www.yoheim.net/tmp/bitcoin_3.anno')
    }
  ]

  return res.json({
    status        : 'ok',
    pdf           : new Buffer(pdf).toString('base64'),
    pdftxt,
    annotations
  })

}

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

  // TODO Send an uplod request to Deep Scholar, and treat the response.

  res.json({ message : 'ok' })
}

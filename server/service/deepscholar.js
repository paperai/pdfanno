/**
 * Service for DeepScholar.
 */
const request = require('request')
const rp = require('request-promise')

/**
 * Get document information.
 */
module.exports.getDocumentInformation = async ({ apiRoot, documentId }) => {

  try {

    return await rp({
      url  : `${apiRoot}/papers/${documentId}`,
      json : true
    })

  } catch (res) {

    if (res.statusCode === 404) {
      return null
    }

    throw res
  }

}

module.exports.getAnnotations = async ({ apiRoot, documentId, token }) => {

  try {

    return await rp({
      url     : `${apiRoot}/papers/${documentId}/annotations/pdf`,
      json : true,
      headers : {
        authorization : `bearer ${token}`
      }
    })

  } catch (res) {

    if (res.statusCode === 404) {
      return []
    }

    throw res
  }

}

module.exports.upload = async ({ apiRoot, documentId, token, anno }) => {

  return await rp({
    url : `${apiRoot}/papers/${documentId}/annotations/pdf`,
    method : 'PUT',
    headers : {
      authorization : `bearer ${token}`
    },
    json : true,
    body : { anno }
  })

}

























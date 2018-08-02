/**
 * Service - PDF related.
 */
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec
const crypto = require('crypto')
const request = require('request')
const rp = require('request-promise')
const mkdirp = require('mkdirp')
const packageJson = require('../../package.json')

// const constants = require('../../src/shared/constants')
const ANNO_FILE_EXTENSION = 'pdfanno'

module.exports.deepscholarService = require('./deepscholar')

module.exports.fetchPDF = async url => {

  const options = {
    method  : 'GET',
    url,
    headers : {
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.124 Safari/537.36',
    },
    // treat a response as a binary.
    encoding : null
  }

  try {
    const pdf = await rp(options)
    console.log('PDF URL:', url)
    console.log('PDF SIZE:', pdf.length)
    return pdf
  } catch (res) {
    const statusCode = res.statusCode
    if (statusCode === 404) {
      console.log(`PDF not found. url=${url}`)
      return null
    }
    throw res
  }
}

/**
 * Get a pdftxt file from remote.
 * @param url
 * @returns {Promise<null>}
 */
module.exports.fetchPDFText = async url => {

  console.log('fetching a pdftxt from remove:', url)

  const options = {
    method   : 'GET',
    url      : url,
    encoding : 'utf8'
  }

  try {
    return await rp(options)
  } catch (res) {
    const statusCode = res.statusCode
    if (statusCode === 404) {
      console.log(`PDFText not found. url=${url}`)
      return null
    }
    throw res
  }
}

module.exports.fetchAnnotation = async url => {

  const options = {
    method   : 'GET',
    url      : url,
    encoding : 'utf8'
  }

  try {
    const pdftxt = await rp(options)
    return pdftxt
  } catch (res) {
    const statusCode = res.statusCode
    if (statusCode === 404) {
      console.log(`Annotation not found. url=${url}`)
      return null
    }
    throw res
  }
}

/**
 * Save a PDF file, and return the saved path.
 */
const savePDF = (fileName, content) => {
  return new Promise((resolve, reject) => {

    const dataPath = path.resolve(__dirname, '..', 'server-data', 'pdf')
    if (!fs.existsSync(dataPath)) {
      mkdirp.sync(dataPath)
    }
    const pdfPath = path.resolve(dataPath, fileName)
    // TODO Use Async.
    fs.writeFileSync(pdfPath, content)

    resolve(pdfPath)
  })
}
module.exports.savePDF = savePDF

module.exports.createPdftxt = async (pdf) => {
  const fname = String(new Date().getTime())
  const fpath = await savePDF(fname, pdf)
  const pdftxt = await analyzePDF(fpath)
  return pdftxt
}


// Analize pdf with pdfreader.jar.
const analyzePDF = async (pdfPath) => {

  // Check java command exits.
  try {
    await execCommand('java -version')
  } catch (e) {
    throw new Error('java command not found.')
  }

  // Load pdfextract.jar.
  if (!isPDFExtractLoaded()) {
    await loadPDFExract()
  }

  // Analyze the PDF.
  const jarPath = getPDFExtractPath()
  const cmd = `java -classpath ${jarPath} PDFExtractor ${pdfPath}`
  const { stdout, stderr } = await execCommand(cmd)

  return stdout
}
module.exports.analyzePDF = analyzePDF

// Get a user annotation.
module.exports.getUserAnnotation = (documentId, userId) => {

  // const annotationPath = path.resolve(__dirname, '..', 'userdata', 'anno', userId, `${documentId}.anno`)
  const annotationPath = path.resolve(__dirname, '..', 'userdata', 'anno', userId, `${documentId}.${ANNO_FILE_EXTENSION}`)
  console.log('annotationPath:', annotationPath)
  if (!fs.existsSync(annotationPath)) {
    return null
  }

  return fs.readFileSync(annotationPath, 'utf-8')
}

module.exports.loadCachePdftxt = pdf => {

  const path = getPdftxtPath(pdf)

  if (fs.existsSync(path)) {
    return fs.readFileSync(path, 'utf-8')
  }

  return null
}

module.exports.savePdftxt = (pdf, pdftxt) => {

  const dir = getPdftxtDir()
  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir)
  }

  const path = getPdftxtPath(pdf)
  fs.writeFileSync(path, pdftxt, 'utf-8')
}

function createHashFromPdf (pdf) {
  const sha256 = crypto.createHash('sha256')
  sha256.update(pdf, 'binary')
  return sha256.digest('hex')
}

function getPdftxtDir () {
  return path.resolve(__dirname, '..', 'server-data', 'pdftxt', packageJson.pdfextract.version)
}

function getPdftxtPath (pdf) {
  const hash = createHashFromPdf(pdf)
  return path.resolve(getPdftxtDir(), hash)
}

// Execute an external command.
function execCommand(command) {
  console.log('execCommand: ' + command)
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer : 1024 * 1024 * 50 }, (err, stdout, stderr) => {
      if (err) {
        reject({ err, stdout, stderr })
      }
      resolve({ stdout, stderr })
    })
  })
}

function getPDFExtractPath () {
  return path.resolve(__dirname, '..', 'extlib', `pdfextract-${packageJson.pdfextract.version}.jar`)
}

function isPDFExtractLoaded () {
  return fs.existsSync(getPDFExtractPath())
}

function loadPDFExract () {

  return new Promise((resolve, reject) => {

    const reqConfig = {
      method   : 'GET',
      url      : packageJson.pdfextract.url,
      encoding : null
    }

    request(reqConfig, function(err, response, buf) {

      if (err) {
        reject(err)
      }

      const dirPath = path.resolve(__dirname, '..', 'extlib')
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
      }

      fs.writeFileSync(getPDFExtractPath(), buf)
      resolve()
    })
  })
}

module.exports.getAnnotationSchema  = () => {
  const schemaPath = path.resolve(__dirname, '..', '..', 'schemas', 'pdfanno-schema.json')

  if (fs.existsSync(schemaPath)) {
    // return JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
    return fs.readFileSync(schemaPath, 'utf-8')
  }
  return null
}

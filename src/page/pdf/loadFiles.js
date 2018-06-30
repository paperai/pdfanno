const constants = require('../../shared/constants')

/**
 *  Functions depending on pdfanno-core.js.
 */

/**
 * Load PDFs and Annos via Browse button.
 */
export default function loadFiles (files) {

  let { pdfNames, annoNames } = getContents(files)

  return new Promise((resolve, reject) => {

    let promises = []

    // Load pdfs.
    let p = pdfNames.map(file => {
      return new Promise((resolve, reject) => {

        let fileReader = new FileReader()
        fileReader.onload = event => {

          resolve({
            type    : 'content',
            name    : _excludeBaseDirName(file.webkitRelativePath),
            content : event.target.result
          })

        }
        fileReader.readAsArrayBuffer(file)
      })
    })
    promises = promises.concat(p)

    // Load annos.
    p = annoNames.map(file => {
      return new Promise((resolve, reject) => {
        let fileReader = new FileReader()
        fileReader.onload = event => {

          resolve({
            type    : 'anno',
            name    : _excludeBaseDirName(file.webkitRelativePath),
            content : event.target.result
          })
        }
        fileReader.readAsText(file)
      })
    })
    promises = promises.concat(p)

    // Wait for complete.
    Promise.all(promises).then(results => {

      results = sortByName(results)

      const contents = results.filter(r => r.type === 'content')
      const annos = results.filter(r => r.type === 'anno')

      resolve({ contents, annos })
    })

  })
}

/**
 * Sort objects by name.
 */
function sortByName (items) {
  items.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    } else if (a.name > b.name) {
      return 1
    } else {
      return 0
    }
  })
  return items
}

/**
 * Extract PDFs and annotations from files the user specified.
 */
function getContents (files) {
  let pdfNames = []
  let annoNames = []

  for (let i = 0; i < files.length; i++) {

    let file = files[i]
    let relativePath = file.webkitRelativePath

    let frgms = relativePath.split('/')
    if (frgms.length > 2) {
      continue
    }
    console.log('Load:', relativePath)

    // Get files only PDFs or Anno files.
    if (relativePath.match(/\.pdf$/i)) {
      pdfNames.push(file)
    // } else if (relativePath.match(/\.anno$/i)) {
    } else if (relativePath.match(new RegExp(`\\.${constants.ANNO_FILE_EXTENSION}$`, 'i'))) {
      annoNames.push(file)
    }
  }

  return {
    pdfNames,
    annoNames
  }
}

/**
 * Get a filename from a path.
 */
function _excludeBaseDirName (filePath) {
  let frgms = filePath.split('/')
  return frgms[frgms.length - 1]
}


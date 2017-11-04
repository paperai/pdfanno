/*
 * Download the result of pdfextract.jar.
 */
import * as annoUI from 'anno-ui'

/*
 * Setup the function.
 */
export function setup () {

    reset()

    $('#downloadPDFTextButton').on('click', () => {

        // Get the result of pdfextract.
        const pdftxt = window.annoPage.pdftxt
        if (!pdftxt) {
            annoUI.ui.alertDialog.show({ message : 'No pdftxt is available.' })
            return
        }

        // File name for download.
        const fname = getDownloadFileName()

        // Download.
        let blob = new Blob([pdftxt])
        let blobURL = window.URL.createObjectURL(blob)
        let a = document.createElement('a')
        document.body.appendChild(a) // for firefox working correctly.
        a.download = fname
        a.href = blobURL
        a.click()
        a.parentNode.removeChild(a)
    })

    window.addEventListener('didCloseViewer', disable)
    window.addEventListener('willChangeContent', disable)
    window.addEventListener('didChangeContent', enable)
}

/*
 * Reset events.
 */
function reset () {
    $('#downloadPDFTextButton').off('click')
    window.removeEventListener('didCloseViewer', disable)
    window.removeEventListener('willChangeContent', disable)
    window.removeEventListener('didChangeContent', enable)
}

/*
 * Enable UI.
 */
function enable () {
    $('#downloadPDFTextButton').removeAttr('disabled')
}

/*
 * Disable UI.
 */
function disable () {
    $('#downloadPDFTextButton').attr('disabled', 'disabled')
}

/**
 * Get the file name for download.
 */
function getDownloadFileName () {

    // The name of Primary Annotation.
    let primaryAnnotationName
    $('#dropdownAnnoPrimary a').each((index, element) => {
        let $elm = $(element)
        if ($elm.find('.fa-check').hasClass('no-visible') === false) {
            primaryAnnotationName = $elm.find('.js-annoname').text()
        }
    })
    if (primaryAnnotationName) {
        return primaryAnnotationName.replace('.anno', '') + 'pdftxt'
    }

    // The name of Content.
    let pdfFileName = window.annoPage.getCurrentContentName()
    return pdfFileName.replace(/\.pdf$/i, '.pdftxt')
}

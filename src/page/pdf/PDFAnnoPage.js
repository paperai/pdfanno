import axios from 'axios'
import * as annoUI from 'anno-ui'
import loadFiles from './loadFiles'
import { anyOf, dispatchWindowEvent } from '../../shared/util'
import { convertToExportY, paddingBetweenPages, nextZIndex } from '../../shared/coords'
import {
    listenWindowLeaveEvent,
    unlistenWindowLeaveEvent,
    adjustViewerSize
} from '../util/window'

/**
 * PDFAnno's Annotation functions for Page produced by .
 */
export default class PDFAnnoPage {

    constructor () {
        this.autoBind()
        this.setup()
    }

    autoBind () {
        Object.getOwnPropertyNames(this.constructor.prototype)
            .filter(prop => typeof this[prop] === 'function')
            .forEach(method => {
                this[method] = this[method].bind(this)
            })
    }

    setup () {
        this.listenWindowEvents()
    }

    listenWindowEvents () {

        // Disable shortcut temporary.

        // window.addEventListener('digit1Pressed' , () => {
        //     this.createSpan()
        // })
        // window.addEventListener('digit2Pressed' , () => {
        //     this.createRelation('one-way')
        // })
        // window.addEventListener('digit3Pressed' , () => {
        //     this.createRelation('two-way')
        // })
        // window.addEventListener('digit4Pressed' , () => {
        //     this.createRelation('link')
        // })
    }

    /**
     * Start PDFAnno Application.
     */
    startViewerApplication () {

        // Alias for convenience.
        window.iframeWindow = $('#viewer iframe').get(0).contentWindow

        window.iframeWindow.addEventListener('DOMContentLoaded', () => {

            // Adjust the height of viewer.
            adjustViewerSize()

            // Reset the confirm dialog at leaving page.
            unlistenWindowLeaveEvent()

            dispatchWindowEvent('iframeReady')
        })

        window.iframeWindow.addEventListener('pagerendered', ev => {
            dispatchWindowEvent('pagerendered', ev.detail)
        })

        window.iframeWindow.addEventListener('annotationrendered', () => {

            // Restore the status of AnnoTools.
            this.disableAnnotateFunctions()
            this.enableAnnotateFunction(window.currentAnnoToolType)

            dispatchWindowEvent('annotationrendered')
        })

        // Set the confirm dialog when leaving a page.
        window.iframeWindow.addEventListener('annotationUpdated', () => {
            listenWindowLeaveEvent()
            dispatchWindowEvent('annotationUpdated')
        })

        // enable text input.
        window.iframeWindow.addEventListener('enableTextInput', e => {
            dispatchWindowEvent('enableTextInput', e.detail)
        })

        // disable text input.
        window.iframeWindow.addEventListener('disappearTextInput', e => {
            dispatchWindowEvent('disappearTextInput', e.detail)
        })

        window.iframeWindow.addEventListener('annotationDeleted', e => {
            dispatchWindowEvent('annotationDeleted', e.detail)
        })

        window.iframeWindow.addEventListener('annotationHoverIn', e => {
            dispatchWindowEvent('annotationHoverIn', e.detail)
        })

        window.iframeWindow.addEventListener('annotationHoverOut', e => {
            dispatchWindowEvent('annotationHoverOut', e.detail)
        })

        window.iframeWindow.addEventListener('annotationSelected', e => {
            dispatchWindowEvent('annotationSelected', e.detail)
        })

        window.iframeWindow.addEventListener('annotationDeselected', () => {
            dispatchWindowEvent('annotationDeselected')
        })

        window.iframeWindow.addEventListener('digit1Pressed', () => {
            dispatchWindowEvent('digit1Pressed')
        })

        window.iframeWindow.addEventListener('digit2Pressed', () => {
            dispatchWindowEvent('digit2Pressed')
        })

        window.iframeWindow.addEventListener('digit3Pressed', () => {
            dispatchWindowEvent('digit3Pressed')
        })

        window.iframeWindow.addEventListener('digit4Pressed', () => {
            dispatchWindowEvent('digit4Pressed')
        })
    }

    /**
     * Load files(contents and annoFiles).
     *
     * @param {Array<File>} files - files user selected in a file dialog.
     * @return {Promise}
     */
    loadFiles (files) {
        return loadFiles(files).then(result => {
            this.contentFiles = result.contents.map(c => {
                return Object.assign(c, {
                    selected : false
                })
            })
            this.annoFiles = result.annos.map(a => {
                return Object.assign(a, {
                    primary   : false,
                    reference : false
                })
            })
        })
    }

    getContentFile (name) {
        const items = this.contentFiles.filter(c => c.name === name)
        if (items.length > 0) {
            return items[0]
        }
        return null
    }

    getAnnoFile (name) {
        const items = this.annoFiles.filter(c => c.name === name)
        if (items.length > 0) {
            return items[0]
        }
        return null
    }

    displayContent (contentName) {

        let contentFile = this.contentFiles.filter(c => c.name === contentName)
        if (contentFile.length === 0) {
            console.log('displayContent: NOT FOUND FILE. file=', contentName)
            return
        }

        this.displayViewer(contentFile[0])
    }

    displayViewer (contentFile) {

        // Reset settings.
        this.resetPDFViewerSettings()

        // Load PDF.
        const uint8Array = new Uint8Array(contentFile.content)
        window.iframeWindow.PDFViewerApplication.open(uint8Array)

        // Set the PDF file name.
        window.iframeWindow.PDFView.url = contentFile.name

        // Save the current.
        this.currentContentFile = contentFile
    }

    setCurrentContentFile (contentFile) {
        this.currentContentFile = contentFile
    }

    getCurrentContentFile () {
        return this.currentContentFile
    }

    /**
     * Start the viewer.
     */
    initializeViewer (initialPDFPath = '../pdfs/P12-1046.pdf') {

        window.pdf = null
        window.pdfName = null

        // Reset setting.
        this.resetPDFViewerSettings()

        let url = './pages/viewer.html'
        if (initialPDFPath) {
            url += '?file=' + initialPDFPath
        }

        // Reload pdf.js.
        $('#viewer iframe').remove()
        $('#viewer').html('<iframe src="' + url + '" class="anno-viewer" frameborder="0"></iframe>')
    }

    /**
     * Close the viewer.
     */
    closePDFViewer () {
        if (window.iframeWindow && window.iframeWindow.PDFViewerApplication) {
            window.iframeWindow.PDFViewerApplication.close()
            $('#numPages', window.iframeWindow.document).text('')
            this.currentContentFile = null
        }
    }

    /**
     * Reset the setting of PDFViewer.
     */
    resetPDFViewerSettings () {
        localStorage.removeItem('database')
    }

    /**
     * Create a Span annotation.
     */
    createSpan ({ text = null } = {}) {
        // TODO Refactoring: a little too long.

        // Get user selection.
        const rects = window.iframeWindow.PDFAnnoCore.default.UI.getRectangles()

        // Use a search result.
        let highlight
        if (window.searchPosition > -1) {
            highlight = window.searchHighlights[window.searchPosition]
        }

        // Check empty.
        if (!rects && !highlight) {
            return annoUI.ui.alertDialog.show({ message : 'Text span is not selected.' })
        }

        // Create a new rectAnnotation.
        if (rects) {
            window.iframeWindow.PDFAnnoCore.default.UI.createSpan({ text, zIndex : nextZIndex() })

        } else if (highlight) {

            const s = new window.SpanAnnotation({
                page     : highlight.page,
                position : highlight.position,
                label    : text,
                text     : highlight.text,
                zIndex   : nextZIndex()
            })
            window.add(s)

            // TODO Refactoring.
            var event = document.createEvent('CustomEvent')
            event.initCustomEvent('enableTextInput', true, true, {
                uuid      : s.annotation.uuid,
                text      : text,
                autoFocus : true
            })
            window.dispatchEvent(event)
        }

        // Notify annotation added.
        dispatchWindowEvent('annotationrendered')
    }

    /**
     * Create a Relation annotation.
     */
    createRelation ({ type, text = null } = {}) {

        // for old style.
        if (arguments.length === 1 && typeof arguments[0] === 'string') {
            type = arguments[0]
        }

        let selectedAnnotations = window.iframeWindow.annotationContainer.getSelectedAnnotations()
        selectedAnnotations = selectedAnnotations.filter(a => {
            return a.type === 'area' || a.type === 'span'
        }).sort((a1, a2) => {
            return (a1.selectedTime - a2.selectedTime) // asc
        })

        if (selectedAnnotations.length < 2) {
            return annoUI.ui.alertDialog.show({ message : 'Two annotated text spans are not selected.\nTo select multiple annotated spans, click the first annotated span, then Ctrl+Click (Windows) or Cmd+Click (OSX) the second span.' })
        }

        const first  = selectedAnnotations[selectedAnnotations.length - 2]
        const second = selectedAnnotations[selectedAnnotations.length - 1]
        console.log('first:second,', first, second)

        // Check duplicated.
        const arrows = window.iframeWindow.annotationContainer
                        .getAllAnnotations()
                        .filter(a => a.type === 'relation')
                        .filter(a => {
                            return anyOf(a.rel1Annotation.uuid, [first.uuid, second.uuid])
                                    && anyOf(a.rel2Annotation.uuid, [first.uuid, second.uuid])
                        })

        if (arrows.length > 0) {
            console.log('same found!!!')
            // Update!!
            arrows[0].direction = type
            arrows[0].rel1Annotation = first
            arrows[0].rel2Annotation = second
            arrows[0].text = text
            arrows[0].save()
            arrows[0].render()
            arrows[0].enableViewMode()
            // Show label input.
            var event = document.createEvent('CustomEvent')
            event.initCustomEvent('enableTextInput', true, true, {
                uuid : arrows[0].uuid,
                text : arrows[0].text
            })
            window.dispatchEvent(event)
            return
        }

        window.iframeWindow.PDFAnnoCore.default.UI.createRelation({
            type,
            anno1 : first,
            anno2 : second,
            text
        })

        // Notify annotation added.
        dispatchWindowEvent('annotationrendered')
    }

    /**
        Disable annotation tool buttons.
    */
    disableRect () {
        window.iframeWindow.PDFAnnoCore.default.UI.disableRect()
    }

    /**
     * Enable an annotation tool.
     */
    enableRect () {
        window.iframeWindow.PDFAnnoCore.default.UI.enableRect()
    }

    /**
     * Display annotations an user selected.
     */
    displayAnnotation (isPrimary) {

        // Check the viewer not clised.
        if ($('#numPages', window.iframeWindow.document).text() === '') {
            return
        }

        let annotations = []
        let colors = []
        let primaryIndex = -1

        // Primary annotation.
        if (isPrimary) {
            $('#dropdownAnnoPrimary a').each((index, element) => {
                let $elm = $(element)
                if ($elm.find('.fa-check').hasClass('no-visible') === false) {
                    let annoPath = $elm.find('.js-annoname').text()

                    const annoFile = window.annoPage.getAnnoFile(annoPath)
                    if (!annoFile) {
                        console.log('ERROR')
                        return
                    }
                    primaryIndex = 0
                    annotations.push(annoFile.content)
                    let color = null // Use the default color used for edit.
                    colors.push(color)

                    let filename = annoFile.name
                    localStorage.setItem('_pdfanno_primary_annoname', filename)
                    console.log('filename:', filename)
                }
            })
        }

        // Reference annotations.
        if (!isPrimary) {
            $('#dropdownAnnoReference a').each((index, element) => {
                let $elm = $(element)
                if ($elm.find('.fa-check').hasClass('no-visible') === false) {
                    let annoPath = $elm.find('.js-annoname').text()

                    const annoFile = window.annoPage.getAnnoFile(annoPath)

                    if (!annoFile) {
                        console.log('ERROR')
                        return
                    }
                    annotations.push(annoFile.content)
                    let color = $elm.find('.js-anno-palette').spectrum('get').toHexString()
                    console.log(color)
                    colors.push(color)
                }
            })
        }

        console.log('colors:', colors)

        // Create import data.
        let paperData = {
            primary : primaryIndex,
            colors,
            annotations
        }

        // Import annotations to Viewer.
        window.annoPage.importAnnotation(paperData, isPrimary)
    }

    /**
     *  Disable annotation tool buttons.
     */
    disableAnnotateFunctions () {
        window.iframeWindow.PDFAnnoCore.default.UI.disableRect()
    }

    /**
     * Enable an annotation tool.
     */
    enableAnnotateFunction (type) {
        if (type === 'rect') {
            window.iframeWindow.PDFAnnoCore.default.UI.enableRect()
        }
    }

    /**
     * Get all annotations.
     */
    getAllAnnotations () {
        return window.iframeWindow.annotationContainer.getAllAnnotations()
    }

    /**
     * Get selected annotations.
     */
    getSelectedAnnotations () {
        return window.iframeWindow.annotationContainer.getSelectedAnnotations()
    }

    /**
     * Find an annotation by id.
     */
    findAnnotationById (id) {
        return window.iframeWindow.annotationContainer.findById(id)
    }

    /**
     * Clear the all annotations from the view and storage.
     */
    clearAllAnnotations () {
        if (window.iframeWindow) {
            window.iframeWindow.annotationContainer.getAllAnnotations().forEach(a => a.destroy())
        }
    }

    /**
     * Add an annotation to the container.
     */
    addAnnotation  (annotation) {
        window.iframeWindow.annotationContainer.add(annotation)
    }

    /**
     * Create a new rect annotation.
     */
    createRectAnnotation (options) {
        return window.iframeWindow.PDFAnnoCore.default.RectAnnotation.newInstance(options)
    }

    /**
     * Create a new span annotation.
     */
    createSpanAnnotation (options) {
        return window.iframeWindow.PDFAnnoCore.default.SpanAnnotation.newInstance(options)
    }

    /**
     * Create a new relation annotation.
     */
    createRelationAnnotation (options) {
        return window.iframeWindow.PDFAnnoCore.default.RelationAnnotation.newInstance(options)
    }

    /**
     * Import annotations from UI.
     */
    importAnnotation (paperData, isPrimary) {
        window.iframeWindow.annotationContainer.importAnnotations(paperData, isPrimary).then(result => {
            // Notify annotations added.
            dispatchWindowEvent('annotationrendered')
        })
    }

    /**
     * Scroll window to the annotation.
     */
    scrollToAnnotation (id) {

        let annotation = window.annoPage.findAnnotationById(id)

        if (annotation) {

            // scroll to.
            let _y = annotation.y || annotation.y1 || annotation.rectangles[0].y
            let { pageNumber, y } = convertToExportY(_y)
            let pageHeight = window.annoPage.getViewerViewport().height
            let scale = window.annoPage.getViewerViewport().scale
            _y = (pageHeight + paddingBetweenPages) * (pageNumber - 1) + y * scale
            _y -= 100
            $('#viewer iframe').contents().find('#viewer').parent()[0].scrollTop = _y

            // highlight.
            annotation.highlight()
            setTimeout(() => {
                annotation.dehighlight()
            }, 1000)
        }
    }

    /**
     * Get the export data of annotations.
     *
     * @return {Promise}
     */
    exportData () {
        return window.iframeWindow.annotationContainer.exportData()
    }

    /**
     * Get the viewport of the viewer.
     */
    getViewerViewport () {
        return window.iframeWindow.PDFView.pdfViewer.getPageView(0).viewport
    }

    /**
     * Get the content's name displayed now.
     */
    getCurrentContentName () {
        return window.iframeWindow.getFileName(window.iframeWindow.PDFView.url)
    }

    /**
     * Manage the ctrl button is enable/disable.
     */
    manageCtrlKey (type) {

        if (type === 'on') {
            window.iframeWindow.ctrlPressed = true

        } else if (type === 'off') {
            window.iframeWindow.ctrlPressed = false
        }
    }

    /**
     * Load a PDF data from the server.
     */
    loadPDFFromServer (url) {
        return new Promise((resolve, reject) => {
            // Load a PDF as ArrayBuffer.
            var xhr = new XMLHttpRequest()
            xhr.open('GET', window.API_ROOT + '/load_pdf?url=' + window.encodeURIComponent(url), true)
            xhr.responseType = 'json'
            xhr.onload = function () {
                if (this.status === 200) {
                    // Error handling.
                    if (this.response.status === 'failure') {
                        let error = this.response.err.stderr || this.response.err
                        return reject(error)
                    }
                    // Get a PDF as arrayBuffer.
                    const pdf = Uint8Array.from(atob(this.response.pdf), c => c.charCodeAt(0))
                    const analyzeResult = this.response.analyzeResult
                    resolve({ pdf, analyzeResult })
                }
            }
            xhr.timeout = 120 * 1000 // 120s
            xhr.ontimeout = function () {
                reject('Failed to load the PDF.')
            }
            xhr.onerror = function (err) {
                reject(err)
            }
            xhr.send()
        })
    }

    /**
     * Load an annotation file from the server.
     */
    loadAnnoFileFromServer (url) {
        return axios.get(`${window.API_ROOT}/api/load_anno?url=${url}`).then(res => {
            if (res.status !== 200 || res.data.status === 'failure') {
                let reason = ''
                if (res.data.error) {
                    reason = '<br>Reason: ' + res.data.error
                }
                annoUI.ui.alertDialog.show({ message : 'Failed to load an anno file. url=' + url + reason })
                return Promise.reject()
            }
            return res.data.anno
        })
    }

}

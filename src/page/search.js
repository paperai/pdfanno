/**
 * Search functions.
 */
import { paddingBetweenPages, nextZIndex } from '../shared/coords'
import { customizeAnalyzeResult } from './util/analyzer'

/**
 * The analyze data per pages.
 */
let pages = []

/**
 * Search type ( text / dictionary )
 */
let searchType = null

/**
 * The position where a search result is highlighted.
 */
let searchPosition = -1

/**
 * The highlights for search.
 */
let searchHighlights = []

/**
 * Texts for dictionary search.
 */
let dictonaryTexts

/**
 * Setup the search function.
 */
export function setup (analyzeData) {

    pages = customizeAnalyzeResult(analyzeData)

    enableSearchUI()
}

/**
 * Get the current highlight.
 */
export function getSearchHighlight () {
    if (searchPosition > -1) {
        return searchHighlights[searchPosition]
    }
    return null
}

function enableSearchUI () {
    $('#searchWord, .js-dict-match-file').removeAttr('disabled')
}

window.addEventListener('DOMContentLoaded', () => {

    const DELAY = 500
    let timerId

    $('#searchWord').on('keyup', e => {

        // Enter key.
        if (e.keyCode === 13) {
            nextResult()
            return
        }

        if (timerId) {
            clearTimeout(timerId)
            timerId = null
        }

        timerId = setTimeout(() => {
            timerId = null
            searchType = 'text'
            doSearch()
        }, DELAY)
    })

    $('.js-search-case-sensitive, .js-search-regexp').on('change', () => {
        searchType = 'text'
        doSearch()
    })

    $('.js-search-case-sensitive, .js-search-regexp').on('click', e => {
        $(e.currentTarget).blur()
    })

    $('.js-search-clear').on('click', e => {
        // Clear search.
        $('#searchWord').val('')
        searchType = null
        doSearch()
        $(e.currentTarget).blur()
    })

    // Re-render the search results.
    window.addEventListener('pagerendered', rerenderSearchResults)

    $('.js-search-prev, .js-search-next').on('click', e => {

        if (searchType !== 'text') {
            return
        }

        // No action for no results.
        if (searchHighlights.length === 0) {
            return
        }

        if ($(e.currentTarget).hasClass('js-search-prev')) {
            prevResult()
        } else {
            nextResult()
        }
    })
})

/**
 * Highlight the prev search result.
 */
function prevResult () {
    searchPosition--
    if (searchPosition < 0) {
        searchPosition = searchHighlights.length - 1
    }
    highlightSearchResult()
}

/**
 * Highlight the next search result.
 */
function nextResult () {
    searchPosition++
    if (searchPosition >= searchHighlights.length) {
        searchPosition = 0
    }
    highlightSearchResult()
}

/**
 * Highlight a single search result.
 */
function highlightSearchResult () {

    $('.search-current-position').text(searchPosition + 1)

    $('.pdfanno-search-result', window.iframeWindow.document).removeClass('pdfanno-search-result--highlight')

    const highlight = searchHighlights[searchPosition]
    highlight.$elm.addClass('pdfanno-search-result--highlight')

    // Scroll to.
    let pageHeight = window.annoPage.getViewerViewport().height
    let scale = window.annoPage.getViewerViewport().scale
    let _y = (pageHeight + paddingBetweenPages) * (highlight.page - 1) + highlight.top * scale
    _y -= 100
    $('#viewer iframe').contents().find('#viewer').parent()[0].scrollTop = _y

}

/**
 * Render search results.
 */
function rerenderSearchResults () {

    // Remove olds.
    $('.pdfanno-search-result', window.iframeWindow.document).remove()

    // Display.
    // TODO 高速化。計測から。jQueryアクセスやappendを改善したら早そう.
    searchHighlights.forEach((highlight, index) => {
        const $textLayer = $(`.page[data-page-number="${highlight.page}"] .textLayer`, window.iframeWindow.document)
        // set the depth.
        highlight.$elm.css('z-index', nextZIndex())
        $textLayer.append(highlight.$elm)
    })
}

/**
 * Search the position of  a word / words which an user input.
 */
function search ({ hay, needle, isCaseSensitive = false, useRegexp = false }) {
    if (!needle) {
        return []
    }
    const SPECIAL_CHARS_REGEX = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g
    const flags = 'g' + (isCaseSensitive === false ? 'i' : '')
    if (useRegexp === false) {
        needle = needle.replace(SPECIAL_CHARS_REGEX, '\\$&')
    }
    let re = new RegExp(needle, flags)
    let positions = []
    let match
    while ((match = re.exec(hay)) != null) {
        positions.push({
            start : match.index,
            end   : match.index + match[0].length
        })
        if (positions.length <= 11) {
            console.log(match)
        }
    }
    return positions
}

function doSearch ({ query = null } = {}) {

    // Check enable.
    if ($('#searchWord').is('[disabled]')) {
        console.log('Search function is not enabled yet.')
        return
    }

    // Remove highlights for search results.
    $('.pdfanno-search-result', window.iframeWindow.document).remove()
    $('.search-hit').addClass('hidden')
    $('.js-dict-match-cur-pos, .js-dict-match-hit-counts').text('000')

    let text
    let isCaseSensitive
    let useRegexp
    if (searchType === 'text') {
        text = $('#searchWord').val()
        isCaseSensitive = $('.js-search-case-sensitive')[0].checked
        useRegexp = $('.js-search-regexp')[0].checked
    } else {
        text = query
        isCaseSensitive = $('.js-dict-match-case-sensitive')[0].checked
        useRegexp = true
    }

    console.log(`doSearch: searchType=${searchType} text="${text}", caseSensitive=${isCaseSensitive}, regexp=${useRegexp}`)

    // Reset.
    searchPosition = -1
    searchHighlights = []

    // The min length of text for searching.
    const MIN_LEN = 2
    if (!text || text.length < MIN_LEN) {
        return
    }

    pages.forEach(page => {

        // Search.
        const positions = search({ hay : page.body, needle : text, isCaseSensitive, useRegexp })

        // Display highlights.
        if (positions.length > 0) {
            positions.forEach(position => {
                const $textLayer = $(`.page[data-page-number="${page.page}"] .textLayer`, window.iframeWindow.document)
                const infos = page.meta.slice(position.start, position.end)
                // console.log('infos:', infos)
                let fromX, toX, fromY, toY
                infos.forEach(info => {
                    if (!info) {
                        return
                    }
                    const [ x, y, w, h ] = info.split('\t').slice(4, 8).map(parseFloat)
                    fromX = (fromX === undefined ? x : Math.min(x, fromX))
                    toX = (toX === undefined ? (x + w) : Math.max((x + w), toX))
                    fromY = (fromY === undefined ? y : Math.min(y, fromY))
                    toY = (toY === undefined ? (y + h) : Math.max((y + h), toY))
                })
                const scale = window.iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.scale
                let $div = $('<div class="pdfanno-search-result"/>')
                $div.css({
                    top    : fromY * scale + 'px',
                    left   : fromX * scale + 'px',
                    width  : (toX - fromX) * scale + 'px',
                    height : (toY - fromY) * scale + 'px',
                    zIndex : nextZIndex()
                })
                $textLayer.append($div)
                // TODO 後で、改行されたものとかにも対応できるようにする（その場合は、rectsが複数）
                const aPosition = [[ fromX, fromY, (toX - fromX), (toY - fromY) ]]
                searchHighlights.push({
                    page           : page.page,
                    top            : fromY,
                    position       : aPosition,
                    searchPosition : position,
                    $elm           : $div,
                    text
                })
            })
        }
    })

    if (searchHighlights.length > 0) {
        // Init highlight at the current page.
        const currentPage = window.iframeWindow.PDFViewerApplication.page
        let found = false
        for (let i = 0; i < searchHighlights.length; i++) {
            if (currentPage === searchHighlights[i].page) {
                searchPosition = i
                found = true
                break
            }
        }
        // If there is no result at the current page, set the index 0.
        if (!found) {
            searchPosition = 0
        }
        highlightSearchResult()
    }

    if (searchType === 'text') {
        $('.search-hit').removeClass('hidden')
        $('.search-current-position').text(searchPosition + 1)
        $('.search-hit-count').text(searchHighlights.length)
    } else {
        // Dict matching.
        $('.js-dict-match-cur-pos').text(searchPosition + 1)
        $('.js-dict-match-hit-counts').text(searchHighlights.length)
    }
}

/**
 * Dictonary Matching.
 */
window.addEventListener('DOMContentLoaded', () => {

    // Clear prev cache.
    $('.js-dict-match-file :file').on('click', e => {
        $(e.currentTarget).val(null)
    })

    // Load a dictionary for matching.
    $('.js-dict-match-file :file').on('change', e => {

        const files = e.target.files
        if (files.length === 0) {
            window.annoUI.ui.alertDialog.show({ message : 'Select a file.' })
            return
        }

        const fname = files[0].name
        $('.js-dict-match-file-name').text(fname)

        let fileReader = new FileReader()
        fileReader.onload = ev => {
            const texts = ev.target.result.split('\n').map(t => {
                return t.trim()
            }).filter(t => {
                return t
            })
            if (texts.length === 0) {
                window.annoUI.ui.alertDialog.show({ message : 'No text is found in the dictionary file.' })
                return
            }
            dictonaryTexts = texts
            searchByDictionary(texts)
        }
        fileReader.readAsText(files[0])
    })

    // Clear search results.
    $('.js-dict-match-clear').on('click', e => {
        searchType = null
        doSearch()
        $(e.currentTarget).blur()
    })

    // Go to the prev/next result.
    $('.js-dict-match-prev, .js-dict-match-next').on('click', e => {

        if (searchType !== 'dictionary') {
            return
        }

        // No action for no results.
        if (searchHighlights.length === 0) {
            return
        }

        // go to next or prev.
        let num = 1
        if ($(e.currentTarget).hasClass('js-dict-match-prev')) {
            num = -1
        }
        searchPosition += num
        if (searchPosition < 0) {
            searchPosition = searchHighlights.length - 1
        } else if (searchPosition >= searchHighlights.length) {
            searchPosition = 0
        }

        highlightSearchResult()
    })

    // Set the search behavior.
    $('.js-dict-match-case-sensitive').on('change', () => {
        searchByDictionary(dictonaryTexts)
    })
})

/**
 * Search by a dict file.
 */
function searchByDictionary (texts = []) {
    console.log('searchByDictionary:', texts)
    searchType = 'dictionary'
    const query = texts.join('|')
    doSearch({ query })
}

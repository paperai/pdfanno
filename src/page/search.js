/**
 * Search functions.
 */
import { paddingBetweenPages, nextZIndex } from '../shared/coords'
import { customizeAnalyzeResult } from './util/analyzer'

let pages = []

export function setup (analyzeData) {
    console.log('search setup')

    pages = customizeAnalyzeResult(analyzeData)

    // Enable search input field.
    $('#searchWord, .js-dict-match-file').removeAttr('disabled')
}

window.addEventListener('DOMContentLoaded', () => {

    const DELAY = 500
    let timerId

    $('#searchWord').on('keyup', e => {

        // Enter key.
        if (e.keyCode === 13) {
            nextSearchResult()
            return
        }

        if (timerId) {
            clearTimeout(timerId)
            timerId = null
        }

        timerId = setTimeout(() => {
            timerId = null
            window.searchType = 'text'
            doSearch()
        }, DELAY)
    })

    $('.js-search-case-sensitive, .js-search-regexp').on('change', () => {
        window.searchType = 'text'
        doSearch()
    })

    $('.js-search-case-sensitive, .js-search-regexp').on('click', e => {
        $(e.currentTarget).blur()
    })

    $('.js-search-clear').on('click', e => {
        // Clear search.
        $('#searchWord').val('')
        window.searchType = null
        doSearch()
        $(e.currentTarget).blur()
    })

    // Re-render the search results.
    window.addEventListener('pagerendered', rerenderSearchResults)

    $('.js-search-prev, .js-search-next').on('click', e => {

        if (window.searchType !== 'text') {
            return
        }

        // No action for no results.
        if (window.searchHighlights.length === 0) {
            return
        }

        if ($(e.currentTarget).hasClass('js-search-prev')) {
            prevSearchResult()
        } else {
            nextSearchResult()
        }
    })
})

/**
 * Highlight the prev search result.
 */
function prevSearchResult () {
    window.searchPosition--
    if (window.searchPosition < 0) {
        window.searchPosition = window.searchHighlights.length - 1
    }
    highlightSearchResult()
}

/**
 * Highlight the next search result.
 */
function nextSearchResult () {
    window.searchPosition++
    if (window.searchPosition >= window.searchHighlights.length) {
        window.searchPosition = 0
    }
    highlightSearchResult()
}

function highlightSearchResult () {

    $('.search-current-position').text(window.searchPosition + 1)

    $('.pdfanno-search-result', window.iframeWindow.document).removeClass('pdfanno-search-result--highlight')

    const highlight = window.searchHighlights[window.searchPosition]
    highlight.$elm.addClass('pdfanno-search-result--highlight')

    console.log(`highlight: index=${window.searchPosition}, page=${highlight.page}`)

    // Scroll to.
    let pageHeight = window.annoPage.getViewerViewport().height
    let scale = window.annoPage.getViewerViewport().scale
    let _y = (pageHeight + paddingBetweenPages) * (highlight.page - 1) + highlight.top * scale
    _y -= 100
    $('#viewer iframe').contents().find('#viewer').parent()[0].scrollTop = _y

}

function rerenderSearchResults () {

    // No action for no results.
    if (window.searchHighlights.length === 0) {
        return
    }

    // Remove.
    $('.pdfanno-search-result', window.iframeWindow.document).remove()

    // Display.
    window.searchHighlights.forEach((highlight, index) => {
        const $textLayer = $(`.page[data-page-number="${highlight.page}"] .textLayer`, window.iframeWindow.document)
        // set the depth.
        highlight.$elm.css('z-index', nextZIndex())
        $textLayer.append(highlight.$elm)
    })
}

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
    }
    return positions
}

window.searchType = null
window.searchPosition = -1
window.searchHighlights = []

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
    if (window.searchType === 'text') {
        text = $('#searchWord').val()
        isCaseSensitive = $('.js-search-case-sensitive')[0].checked
        useRegexp = $('.js-search-regexp')[0].checked
    } else {
        text = query
        isCaseSensitive = $('.js-dict-match-case-sensitive')[0].checked
        useRegexp = true
    }

    console.log(`doSearch: searchType=${window.searchType} text="${text}", caseSensitive=${isCaseSensitive}, regexp=${useRegexp}`)

    // Reset.
    window.searchPosition = -1
    window.searchHighlights = []

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
                    const [ x, y, w, h ] = info.split('\t').slice(3, 7).map(parseFloat)
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
                window.searchHighlights.push({
                    page     : page.page,
                    top      : fromY,
                    position : aPosition,
                    $elm     : $div,
                    text
                })
            })
        }
    })

    if (window.searchHighlights.length > 0) {
        // Init highlight at the current page.
        const currentPage = window.iframeWindow.PDFViewerApplication.page
        for (let i = 0; i < window.searchHighlights.length; i++) {
            if (currentPage === window.searchHighlights[i].page) {
                window.searchPosition = i
                break
            }
        }
        highlightSearchResult()
    }

    if (window.searchType === 'text') {
        $('.search-hit').removeClass('hidden')
        $('.search-current-position').text(window.searchPosition + 1)
        $('.search-hit-count').text(window.searchHighlights.length)
    } else {
        // Dict matching.
        $('.js-dict-match-cur-pos').text(window.searchPosition + 1)
        $('.js-dict-match-hit-counts').text(window.searchHighlights.length)
    }
}

let dictonaryTexts

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
        window.searchType = null
        doSearch()
        $(e.currentTarget).blur()
    })

    // Go to the prev/next result.
    $('.js-dict-match-prev, .js-dict-match-next').on('click', e => {

        if (window.searchType !== 'dictionary') {
            return
        }

        // No action for no results.
        if (window.searchHighlights.length === 0) {
            return
        }

        // go to next or prev.
        let num = 1
        if ($(e.currentTarget).hasClass('js-dict-match-prev')) {
            num = -1
        }
        window.searchPosition += num
        if (window.searchPosition < 0) {
            window.searchPosition = window.searchHighlights.length - 1
        } else if (window.searchPosition >= window.searchHighlights.length) {
            window.searchPosition = 0
        }

        highlightSearchResult()
    })

    // Set the search behavior.
    $('.js-dict-match-case-sensitive').on('change', () => {
        searchByDictionary(dictonaryTexts)
    })
})

function searchByDictionary (texts = []) {
    console.log('searchByDictionary:', texts)
    window.searchType = 'dictionary'
    const query = texts.join('|')
    doSearch({ query })
}

import { renderCircle } from './renderCircle'

/**
 * Create a Span element.
 * @param {SpanAnnotation} a - span annotation.
 * @return {HTMLElement} a html element describing a span annotation.
 */
export function renderSpan (a) {

    const color = a.color || '#FF0'

    const $base = $('<div/>').css({
        position   : 'absolute',
        top        : 0,
        left       : 0,
        visibility : 'visible'
    }).addClass('anno-span')

    a.rectangles.forEach(r => {
        $base.append(createRect(r, color))
    })

    $base.append(renderCircle({
        x    : a.rectangles[0].x,
        y    : a.rectangles[0].y
    }))

    return $base[0]
}

function createRect (r, color) {

    return $('<div/>').addClass('anno-span__area').css({
        position        : 'absolute',
        top             : r.y + 'px',
        left            : r.x + 'px',
        width           : r.width + 'px',
        height          : r.height + 'px',
        // TODO 背景色に透過を設定して、全体でopacityにはしないようにする
        // そのために、HEXからrgbaに変換する実装が必要.
        backgroundColor : color,
        opacity         : 0.2,
        border          : '1px dashed gray'
    })
}

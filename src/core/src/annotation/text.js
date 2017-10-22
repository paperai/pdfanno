import AbstractAnnotation from './abstract'

/**
 * Text Annotation.
 */
export default class TextAnnotation extends AbstractAnnotation {

    /**
     * Constructor.
     */
    constructor (readOnly, parent) {
        super()

        this.type = 'textbox'
        this.parent = parent
        this.x = 0
        this.y = 0
        this.readOnly = readOnly
        this.$element = this.createDummyElement()
    }

    /**
     * Render a text.
     */
    render () {
        // 何もしない（PDF上にはテキストを表示しない）
    }

    /**
     * Set a hover event.
     */
    setHoverEvent () {
        this.$element.find('text').hover(
            this.handleHoverInEvent,
            this.handleHoverOutEvent
        )
    }

    /**
     * Delete a text annotation.
     */
    destroy () {
        return super.destroy()
    }

    isHit (x, y) {

        if (!this.parent.text || this.deleted) {
            return false
        }

        let $rect = this.$element.find('rect')
        let x1 = parseInt($rect.attr('x'))
        let y1 = parseInt($rect.attr('y'))
        let x2 = x1 + parseInt($rect.attr('width'))
        let y2 = y1 + parseInt($rect.attr('height'))

        return (x1 <= x && x <= x2) && (y1 <= y && y <= y2)
    }

    /**
     * Delete a text annotation if selected.
     */
    deleteSelectedAnnotation () {
        super.deleteSelectedAnnotation()
    }

    /**
     * Handle a hoverin event.
     */
    handleHoverInEvent () {
        this.highlight()
        this.emit('hoverin')
    }

    /**
     * Handle a hoverout event.
     */
    handleHoverOutEvent () {
        this.dehighlight()
        this.emit('hoverout')
    }

}

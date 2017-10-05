import EventEmitter from 'events'
import appendChild from '../render/appendChild'
import { getSVGLayer } from '../UI/utils'
import { dispatchWindowEvent } from '../utils/event'

/**
 * Abstract Annotation Class.
 */
export default class AbstractAnnotation extends EventEmitter {

    /**
     * Check the argument is an annotation.
     */
    static isAnnotation (obj) {
        return obj && obj.uuid && obj.type
    }

    /**
     * Constructor.
     */
    constructor () {
        super()
        this.autoBind()
        this.deleted = false
        this.selected = false
        this.selectedTime = null
    }

    /**
     * Bind the `this` scope of instance methods to `this`.
     */
    autoBind () {
        Object.getOwnPropertyNames(this.constructor.prototype)
            .filter(prop => typeof this[prop] === 'function')
            .forEach(method => {
                this[method] = this[method].bind(this)
            })
    }

    /**
     * Render annotation(s).
     */
    render () {

        this.$element.remove()

        if (this.deleted) {
            return false
        }

        let base = getSVGLayer()
        // TODO getSVGLayer() will be no longer needed.
        if (this.type === 'span' || this.type === 'relation' || this.type === 'area') {
            base = $('#annoLayer2')[0]
        }

        this.$element = $(appendChild(base, this))
        this.textAnnotation && this.textAnnotation.render()

        if (!this.hoverEventDisable && this.setHoverEvent) {
            this.setHoverEvent()
        }

        this.$element.addClass('--viewMode')

        this.selected && this.$element.addClass('--selected')

        this.disabled && this.disable()

        return true
    }

    /**
     * Save the annotation data.
     */
    save () {
        window.annotationContainer.add(this)
    }

    /**
     * Delete the annotation from rendering, a container in window, and a container in localStorage.
     */
    destroy () {
        this.deleted = true
        this.$element.remove()

        let promise = Promise.resolve()

        if (this.uuid) {
            window.annotationContainer.remove(this)
            this.textAnnotation && this.textAnnotation.destroy()
        }

        return promise
    }

    /**
     * Judge the point within the element.
     */
    isHit (x, y) {
        return false
    }

    /**
     * Judge the point within the label.
     */
    isHitText (x, y) {
        return this.textAnnotation && this.textAnnotation.isHit(x, y)
    }

    /**
     * Handle a click event.
     */
    handleClickEvent (e) {
        this.toggleSelect()

        if (this.type !== 'textbox') {

            if (this.selected) {

                // deselect another annotations.
                if (window.ctrlPressed === false) {
                    window.annotationContainer
                        .getSelectedAnnotations()
                        .filter(a => a.uuid !== this.uuid)
                        .forEach(a => a.deselect())
                }

                // TODO Use common function.
                let event = document.createEvent('CustomEvent')
                event.initCustomEvent('annotationSelected', true, true, this)
                window.dispatchEvent(event)

            } else {

                // TODO Use common function.
                let event = document.createEvent('CustomEvent')
                event.initCustomEvent('annotationDeselected', true, true, this)
                window.dispatchEvent(event)

            }
        }
    }

    /**
     * Handle a hoverIn event.
     */
    handleHoverInEvent (e) {
        console.log('handleHoverInEvent')
        this.highlight()
        this.emit('hoverin')
        dispatchWindowEvent('annotationHoverIn', this)
    }

    /**
     * Handle a hoverOut event.
     */
    handleHoverOutEvent (e) {
        console.log('handleHoverOutEvent')
        this.dehighlight()
        this.emit('hoverout')
        dispatchWindowEvent('annotationHoverOut', this)
    }

    /**
     * Highlight the annotation.
     */
    highlight () {
        this.$element.addClass('--hover --emphasis')
        this.textAnnotation && this.textAnnotation.highlight()
    }

    /**
     * Dehighlight the annotation.
     */
    dehighlight () {
        this.$element.removeClass('--hover --emphasis')
        this.textAnnotation && this.textAnnotation.dehighlight()
    }

    /**
     * Select the annotation.
     */
    select () {
        this.selected = true
        this.selectedTime = Date.now()
        this.$element.addClass('--selected')
    }

    /**
     * Deselect the annotation.
     */
    deselect () {
        console.log('deselect')
        this.selected = false
        this.selectedTime = null
        this.$element.removeClass('--selected')
    }

    /**
     * Toggle the selected state.
     */
    toggleSelect () {

        if (this.selected) {
            this.deselect()
            this.textAnnotation && this.textAnnotation.deselect()

        } else {
            this.select()
            this.textAnnotation && this.textAnnotation.select()
        }

    }

    /**
     * Delete the annotation if selected.
     */
    deleteSelectedAnnotation () {

        if (this.isSelected()) {
            this.destroy().then(() => {
                dispatchWindowEvent('annotationDeleted', { uuid : this.uuid })
            })
            return true
        }
        return false
    }

    /**
     * Check whether a boundingCircle is included.
     */
    hasBoundingCircle () {
        return this.$element.find('circle').length > 0
    }

    /**
     * Check whether the annotation is selected.
     */
    isSelected () {
        return this.$element.hasClass('--selected')
    }

    /**
     * Create a dummy DOM element for the timing that a annotation hasn't be specified yet.
     */
    createDummyElement () {
        return $('<div class="dummy"/>')
    }

    /**
     * Enable a view mode.
     */
    enableViewMode () {
        this.render()
        this.textAnnotation && this.textAnnotation.enableViewMode()
    }

    /**
     * Disable a view mode.
     */
    disableViewMode () {
        this.render()
        this.textAnnotation && this.textAnnotation.disableViewMode()
    }

    /**
     * Make the text always visible.
     * This state will be reset at entering the view mode.
     */
    setTextForceDisplay () {
        if (this.textAnnotation) {
            this.textAnnotation.textForceDisplay = true
        }
    }

    resetTextForceDisplay () {
        if (this.textAnnotation) {
            this.textAnnotation.textForceDisplay = false
        }
    }

    setDisableHoverEvent () {
        this.hoverEventDisable = true
    }

    setEnableHoverEvent () {
        this.hoverEventDisable = false
    }

    enable () {
        this.disabled = false
        this.$element.css('pointer-events', 'auto')
    }

    disable () {
        this.disabled = true
        this.$element.css('pointer-events', 'none')
    }

    /**
     * Check the another annotation is equal to `this`.
     */
    equalTo (anotherAnnotation) {
        // Implement Here.
        return false
    }
}

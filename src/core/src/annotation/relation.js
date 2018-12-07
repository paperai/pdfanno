import { uuid } from 'anno-ui/src/utils'
import AbstractAnnotation from './abstract'
import { getRelationTextPosition } from '../utils/relation.js'
import * as Utils from '../../../shared/util'
import {addAnnoLayer} from '../render/layer'

let globalEvent

/**
 * Relation Annotation (one-way / two-way / link)
 */
export default class RelationAnnotation extends AbstractAnnotation {

  /**
   * Constructor.
   */
  constructor () {
    super()

    globalEvent = window.globalEvent

    this.uuid = uuid()
    this.type = 'relation'
    this.direction = null
    this.rel1Annotation = null
    this.rel2Annotation = null
    this.main = true
    this.page = null
    this.text = null
    this.color = null
    this.readOnly = false
    this.$element = this.createDummyElement()

    // for render.
    this.x1 = 0
    this.y1 = 0
    this.x2 = 0
    this.y2 = 0

    globalEvent.on('deleteSelectedAnnotation', this.deleteSelectedAnnotation)
    globalEvent.on('enableViewMode', this.enableViewMode)
    globalEvent.on('rectmoveend', this.handleRelMoveEnd)
  }

  /**
   * Create an instance from an annotation data.
   */
  static newInstance (annotation) {
    let a            = new RelationAnnotation()
    a.uuid           = annotation.uuid || uuid()
    a.direction      = 'relation'
    a.rel1Annotation = AbstractAnnotation.isAnnotation(annotation.rel1) ? annotation.rel1 : window.annotationContainer.findById(annotation.rel1)
    a.rel2Annotation = AbstractAnnotation.isAnnotation(annotation.rel2) ? annotation.rel2 : window.annotationContainer.findById(annotation.rel2)
    a.main           = annotation.main !== undefined ? annotation.main : true
    a.page           = annotation.page || (a.rel1Annotation ? a.rel1Annotation.page : null)
    a.text           = annotation.text
    a.color          = annotation.color
    a.readOnly       = annotation.readOnly || false
    a.zIndex         = annotation.zIndex || 10
    return a
  }

  /**
   * Create an instance from a TOML object.
   */
  static newInstanceFromTomlObject (d) {
    // console.log('relation: newInstanceFromTomlObject')
    d.direction = 'relation'
    // TODO Annotation側を、labelに合わせてもいいかも。
    d.text = d.label
    let rel = RelationAnnotation.newInstance(d)
    return rel
  }

  /**
   * Create sub relation.
   */
  createSubRelation () {
    const sub = RelationAnnotation.newInstance({
      uuid      : null,
      direction : this.direction,
      main      : false,
      page      : this.rel2Annotation ? this.rel2Annotation.page : null,
      text      : this.text,
      color     : this.color,
      readOnly  : this.readOnly
    })

    sub._rel1Annotation = this.rel1Annotation
    sub._rel2Annotation = this.rel2Annotation
    sub.sibling = this
    this.sibling = sub

    return sub
  }

  /**
   * Set a hover event.
   */
  setHoverEvent () {
    this.$element.find('path').hover(
      this.handleHoverInEvent,
      this.handleHoverOutEvent
    )
  }

  /**
   * Setter - rel1Annotation.
   */
  set rel1Annotation (a) {
    this._rel1Annotation = a
    if (this._rel1Annotation) {
      this._rel1Annotation.on('hoverin', this.handleSpanHoverIn)
      this._rel1Annotation.on('hoverout', this.handleSpanHoverOut)
      this._rel1Annotation.on('rectmove', this.handleSpanMove)
      this._rel1Annotation.on('delete', this.handleSpanDelete)
    }
  }

  /**
   * Getter - rel1Annotation.
   */
  get rel1Annotation () {
    return this._rel1Annotation
  }

  /**
   * Setter - rel2Annotation.
   */
  set rel2Annotation (a) {
    this._rel2Annotation = a
    if (this._rel2Annotation) {
      this._rel2Annotation.on('hoverin', this.handleSpanHoverIn)
      this._rel2Annotation.on('hoverout', this.handleSpanHoverOut)
      this._rel2Annotation.on('rectmove', this.handleSpanMove)
      this._rel2Annotation.on('delete', this.handleSpanDelete)
    }
  }

  /**
   * Getter - rel2Annotation.
   */
  get rel2Annotation () {
    return this._rel2Annotation
  }

  /**
   * Determine whether relation is visible or not.
   */
  visible (visiblePages) {
    visiblePages = this.parseVisibleParam(visiblePages)
    return (this._rel1Annotation.page >= visiblePages.first.id || this._rel2Annotation.page >= visiblePages.first.id)
      && (this._rel1Annotation.page <= visiblePages.last.id || this._rel2Annotation.page <= visiblePages.last.id)
  }

  /**
   * Render the annotation.
   */
  render () {
    this.setStartEndPosition()

    let first, last
    if (this._rel1Annotation.page <= this._rel2Annotation.page) {
      first = this._rel1Annotation.page
      last = this._rel2Annotation.page
    } else {
      first = this._rel2Annotation.page
      last = this._rel1Annotation.page
    }

    // If there is no Annotation layer in this pages, create it.
    addAnnoLayer({first, last})

    super.render()
  }

  /**
   * Create an annotation data for save.
   */
  createAnnotation () {
    return {
      uuid      : this.uuid,
      type      : this.type,
      direction : this.direction,
      rel1      : this._rel1Annotation.uuid,
      rel2      : this._rel2Annotation.uuid,
      text      : this.text,
      color     : this.color,
      readOnly  : this.readOnly
    }
  }

  /**
   * Destroy the annotation.
   */
  destroy () {
    let promise = super.destroy()
    if (this._rel1Annotation) {
      this._rel1Annotation.removeListener('hoverin', this.handleSpanHoverIn)
      this._rel1Annotation.removeListener('hoverout', this.handleSpanHoverOut)
      this._rel1Annotation.removeListener('rectmove', this.handleSpanMove)
      this._rel1Annotation.removeListener('delete', this.handleSpanDelete)
      delete this._rel1Annotation
    }
    if (this._rel2Annotation) {
      this._rel2Annotation.removeListener('hoverin', this.handleSpanHoverIn)
      this._rel2Annotation.removeListener('hoverout', this.handleSpanHoverOut)
      this._rel2Annotation.removeListener('rectmove', this.handleSpanMove)
      this._rel2Annotation.removeListener('delete', this.handleSpanDelete)
      delete this._rel2Annotation
    }

    globalEvent.removeListener('deleteSelectedAnnotation', this.deleteSelectedAnnotation)
    globalEvent.removeListener('enableViewMode', this.enableViewMode)
    globalEvent.removeListener('rectmoveend', this.handleRelMoveEnd)

    return promise
  }

  /**
   * Delete the annotation if selected.
   */
  deleteSelectedAnnotation () {
    super.deleteSelectedAnnotation()
  }

  /**
   * Get the position for text.
   */
  // TODO No need ?
  getTextPosition () {
    this.setStartEndPosition()
    return getRelationTextPosition(this.x1, this.y1, this.x2, this.y2, this.text, this.uuid)
  }

  /**
   * Highlight relations.
   */
  highlightRelAnnotations () {
    if (this._rel1Annotation) {
      this._rel1Annotation.highlight()
    }
    if (this._rel2Annotation) {
      this._rel2Annotation.highlight()
    }
  }

  /**
   * Dehighlight relations.
   */
  dehighlightRelAnnotations () {
    if (this._rel1Annotation) {
      this._rel1Annotation.dehighlight()
    }
    if (this.rel2Annotation) {
      this.rel2Annotation.dehighlight()
    }
  }

  /**
   * Handle a selected event on a text.
   */
  handleTextSelected () {
    this.select()
  }

  /**
   * Handle a deselected event on a text.
   */
  handleTextDeselected () {
    this.deselect()
  }

  /**
   * The callback for the relational text hoverred in.
   */
  handleTextHoverIn () {
    // console.log('relation handleTextHoverIn')
    this.highlight()
    this.emit('hoverin')
    this.highlightRelAnnotations()
  }

  /**
   * The callback for the relational text hoverred out.
   */
  handleTextHoverOut () {
    // console.log('relation handleTextHoverOut')
    this.dehighlight()
    this.emit('hoverout')
    this.dehighlightRelAnnotations()
  }

  /**
   * The callback for the relationals hoverred in.
   */
  handleSpanHoverIn (e) {
    // console.log('relation handleSpanHoverIn')
    this.highlight()
    this.highlightRelAnnotations()
  }

  /**
   * The callback for the relationals hoverred out.
   */
  handleSpanHoverOut (e) {
    // console.log('relation handleSpanHoverOut')
    this.dehighlight()
    this.dehighlightRelAnnotations()
  }

  /**
   * The callback that is called relations has benn deleted.
   */
  handleSpanDelete (e) {
    this.destroy()
    if (this.sibling && !e) {
      this.sibling.handleSpanDelete('once')
    }
  }

  /**
   * The callback that is called relations has been moved.
   */
  handleSpanMove () {
    this.render()
  }

  /**
   * The callback that is called relations has finished to be moved.
   */
  handleRelMoveEnd (rectAnnotation) {
    if (this._rel1Annotation === rectAnnotation || this._rel2Annotation === rectAnnotation) {
      this.enableViewMode()
    }
  }

  /**
   * The callback that is called the text content is changed.
   *
   * @param {String} newText - the content an user changed.
   */
  handleTextChanged (newText) {
    this.text = newText
    this.save()
  }

  /**
   * The callback that is called at hoverred in.
   */
  handleHoverInEvent (e) {
    // console.log('relation handleHoverInEvent')
    super.handleHoverInEvent()
    this.highlightRelAnnotations()
  }

  /**
   * The callback that is called at hoverred out.
   */
  handleHoverOutEvent (e) {
    // console.log('relation handleHoverOutEvent')
    super.handleHoverOutEvent()
    this.dehighlightRelAnnotations()
  }

  /**
   * The callback that is called at clicked.
   */
  handleClickEvent (e) {
    super.handleClickEvent(e)
  }

  /**
   * Export Data for TOML.
   * @returns
   */
  export () {
    return {
      head  : this.rel1Annotation.exportId + '',
      tail  : this.rel2Annotation.exportId + '',
      label : this.text || ''
    }
  }

    /**
   * Export Data for TOML.
   * @returns {{type: string, dir: null, ids: *[], label: *|string}}
   */
  export040 () {
    return {
      type  : this.type,
      dir   : this.direction,
      ids   : [ this.rel1Annotation.exportId, this.rel2Annotation.exportId ],
      label : this.text || ''
    }
  }

  /**
   * Enable view mode.
   */
  enableViewMode () {
    this.disableViewMode()
    super.enableViewMode()
    if (!this.readOnly) {
      this.$element.find('path').on('click', this.handleClickEvent)
    }
  }

  /**
   * Disable view mode.
   */
  disableViewMode () {
    super.disableViewMode()
    this.$element.find('path').off('click')
  }

  /**
   * Whether the end point crosses the page or not.
   */
  isCrossPage () {
    return this.rel1Annotation.page !== this.rel2Annotation.page
  }

  /**
   * Get the difference in coordinates between pages.
   * @param {Integer} page
   */
  dxy (page) {
    // The annoLayer does not exist after the scale change.
    // const $targetLayer = $(Utils.getAnnoLayer(page))
    const $targetLayer = $(Utils.getContainer(page))
    const scale = window.PDFView.pdfViewer.getPageView(0).viewport.scale
    return {
      x : Math.round($targetLayer.offset().left / scale),
      y : Math.round($targetLayer.offset().top / scale)
    }
  }

  /**
   * Set the start / end points of the relation.
   */
  setStartEndPosition () {
    let dxy1 = this.dxy(this.page)

    if (this._rel1Annotation) {
      let p = this._rel1Annotation.getBoundingCirclePosition()
      this.x1 = p.x
      this.y1 = p.y

      if (this.isCrossPage() && !this.main) {
        let dxy2 = this.dxy(this.rel1Annotation.page)
        this.x1 += dxy2.x - dxy1.x
        this.y1 += dxy2.y - dxy1.y
        // console.log('t', dxy1, dxy2)
      }
    }

    if (this._rel2Annotation) {
      let p = this._rel2Annotation.getBoundingCirclePosition()
      this.x2 = p.x
      this.y2 = p.y

      if (this.isCrossPage() && this.main) {
        let dxy2 = this.dxy(this.rel2Annotation.page)
        this.x2 += dxy2.x - dxy1.x
        this.y2 += dxy2.y - dxy1.y
        // console.log('s', dxy1, dxy2)
      }
    }
  }

  /**
   * @{inheritDoc}
   */
  equalTo (anno) {
    if (!anno || this.type !== anno) {
      return false
    }

    const isSame = Utils.anyOf(this.rel1Annotation.uuid, [anno.rel1Annotation.uuid, anno.rel2Annotation.uuid])
      && Utils.anyOf(this.rel2Annotation.uuid, [anno.rel1Annotation.uuid, anno.rel2Annotation.uuid])

    return isSame
  }

  /**
   * Returns the coordinates of the upper left corner.
   *
   * @returns
   * @memberof AbstractAnnotation
   */
  leftTopPosition () {
    let top1, top2
    let minX, minY, page
    if (this.rel1Annotation.page === this.rel2Annotation.page) {
      top1 = this.rel1Annotation.leftTopPosition()
      top2 = this.rel2Annotation.leftTopPosition()
      minX = Math.min(top1[0], top2[0])
      minY = Math.min(top1[1], top2[1])
      page = top1[2]
    } else {
      let span = this.rel1Annotation.page < this.rel2Annotation.page ? this.rel1Annotation : this.rel2Annotation
      top1 = span.leftTopPosition()
      minX = top1[0]
      minY = top1[1]
      page = top1[2]
    }

    return [minX, minY, page]
  }
}

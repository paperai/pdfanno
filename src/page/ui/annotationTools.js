/**
 * UI parts - Annotations Tools.
 */

/**
    Set the behavior of the tool buttons for annotations.
*/
export function setup() {

    // TODO Restoreようだけど必要？
    window.currentAnnoToolType = 'view';

    // Rect annotation button.
    $('.js-tool-btn-rect').off('click').on('click', (e) => {

        let $btn = $(e.currentTarget);

        // Make disable.
        if ($btn.hasClass('active')) {
            window.currentAnnoToolType = 'view';
            $btn.removeClass('active').blur();
            window.annoPage.disableRect();

        // Make enable.
        } else {
            window.currentAnnoToolType = 'rect';
            window.annoPage.enableRect();
        }

        return false;
    });

    // Span annotation button.
    $('.js-tool-btn-span').off('click').on('click', e => {
        $(e.currentTarget).blur();
        window.annoPage.createSpan();
    });

    // Relation annotation button.
    $('.js-tool-btn-rel').off('click').on('click', e => {
        const $button = $(e.currentTarget);
        const type = $button.data('type');
        window.annoPage.createRelation(type);
        $button.blur();
    });

}

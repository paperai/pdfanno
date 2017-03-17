/**
 * UI parts - Annotations Tools.
 */


/**
    Set the behavior of the tool buttons for annotations.
*/
export function setup1() {

    $('.js-tool-btn').off('click').on('click', (e) => {

        disableAnnotateTools();

        let $button = $(e.currentTarget);

        if ($button.hasClass('active')) {
            $button
                .removeClass('active')
                .blur();
            return false;
        }

        $('.js-tool-btn.active').removeClass('active');
        $button.addClass('active');

        let type = $button.data('type');


        if (type === 'span') {
            window.iframeWindow.PDFAnnoCore.UI.enableSpan();

        } else if (type === 'one-way') {
            window.iframeWindow.PDFAnnoCore.UI.enableRelation('one-way');

        } else if (type === 'two-way') {
            window.iframeWindow.PDFAnnoCore.UI.enableRelation('two-way');

        } else if (type === 'link') {
            window.iframeWindow.PDFAnnoCore.UI.enableRelation('link');

        } else if (type === 'rect') {
            window.iframeWindow.PDFAnnoCore.UI.enableRect();

        }

        return false;
    });

    $('.js-tool-btn2').off('click').on('click', (e) => {

        let $button = $(e.currentTarget);
        let type = $button.data('type');

        $button.blur();

        if (type === 'download') {
            downloadAnnotation();

        } else if (type === 'delete') {
            deleteAllAnnotations();
        }

        return false;
    });

}


/**
    Disable annotation tool buttons.
*/
function disableAnnotateTools() {
    window.iframeWindow.PDFAnnoCore.UI.disableRect();
    window.iframeWindow.PDFAnnoCore.UI.disableSpan();
    window.iframeWindow.PDFAnnoCore.UI.disableRelation();
    window.iframeWindow.PDFAnnoCore.UI.disableViewMode();
}

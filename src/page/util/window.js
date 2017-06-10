/**
 * Utility for window.
 */

/**
 * Set the confirm dialog at leaving the page.
 */
export function listenWindowLeaveEvent() {
    window.annotationUpdated = true;
    $(window).off('beforeunload').on('beforeunload', () => {
        return 'You don\'t save the annotations yet.\nAre you sure to leave ?';
    });
}

/**
 * Unset the confirm dialog at leaving the page.
 */
export function unlistenWindowLeaveEvent() {
    window.annotationUpdated = false;
    $(window).off('beforeunload');
}

/**
    Adjust the height of viewer according to window height.
*/
export function adjustViewerSize() {
    window.removeEventListener('resize', resizeHandler);
    window.addEventListener('resize', resizeHandler);
    resizeHandler();
}

/**
 * Resize the height of elements adjusting to the window.
 */
export function resizeHandler() {

    // PDFViewer.
    let height = $(window).innerHeight() - $('#viewer').offset().top;
    $('#viewer iframe').css('height', `${height}px`);

    // Dropdown for PDF.
    let height1 = $(window).innerHeight() - ($('#dropdownPdf ul').offset().top || 120);
    $('#dropdownPdf ul').css('max-height', `${height1 - 20}px`);

    // Dropdown for Primary Annos.
    let height2 = $(window).innerHeight() - ($('#dropdownAnnoPrimary ul').offset().top || 120);
    $('#dropdownAnnoPrimary ul').css('max-height', `${height2 - 20}px`);

    // Dropdown for Anno list.
    let height3 = $(window).innerHeight() - ($('#dropdownAnnoList ul').offset().top || 120);
    $('#dropdownAnnoList ul').css('max-height', `${height3 - 20}px`);

    // Dropdown for Reference Annos.
    let height4 = $(window).innerHeight() - ($('#dropdownAnnoReference ul').offset().top || 120);
    $('#dropdownAnnoReference ul').css('max-height', `${height4 - 20}px`);

    // Tools.
    let height5 = $(window).innerHeight() - $('#tools').offset().top;
    $('#tools').css('height', `${height5}px`);
}

export function setupResizableColumns() {

    // Make resizable.
    $('#tools').resizable({
      handles: 'e',
      alsoResizeReverse: '#viewerWrapper',
      start : () => {
        console.log('resize start');
        $('#viewer iframe').css({
            'pointer-events' : 'none',
        });

      },
      stop : () => {
        console.log('resize stop');
        $('#viewer iframe').css({
            'pointer-events' : 'auto',
        });

      }
    });

    // Customize.
    $.ui.plugin.add("resizable", "alsoResizeReverse", {

        start: function() {
            var that = $(this).resizable( "instance" ),
                o = that.options;

            $(o.alsoResizeReverse).each(function() {
                var el = $(this);
                el.data("ui-resizable-alsoresizeReverse", {
                    width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
                    left: parseInt(el.css("left"), 10), top: parseInt(el.css("top"), 10)
                });
            });
        },

        resize: function(event, ui) {
            var that = $(this).resizable( "instance" ),
                o = that.options,
                os = that.originalSize,
                op = that.originalPosition,
                delta = {
                    height: (that.size.height - os.height) || 0,
                    width: (that.size.width - os.width) || 0,
                    top: (that.position.top - op.top) || 0,
                    left: (that.position.left - op.left) || 0
                };

            $(o.alsoResizeReverse).each(function() {
                var el = $(this), start = $(this).data("ui-resizable-alsoresize-reverse"), style = {},
                    css = el.parents(ui.originalElement[0]).length ?
                        [ "width", "height" ] :
                        [ "width", "height", "top", "left" ];

                $.each(css, function(i, prop) {
                    var sum = (start[prop] || 0) - (delta[prop] || 0);
                    if (sum && sum >= 0) {
                        style[prop] = sum || null;
                    }
                });

                el.css(style);
            });
        },

        stop: function() {
            $(this).removeData("resizable-alsoresize-reverse");
        }
    });
}

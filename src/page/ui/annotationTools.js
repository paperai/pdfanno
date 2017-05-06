/**
 * UI parts - Annotations Tools.
 */
import { reloadPDFViewer } from '../util/display';
import { enableAnnotateTool, disableAnnotateTools } from '../util/anno';
import { anyOf } from '../../shared/util';

/**
    Set the behavior of the tool buttons for annotations.
*/
export function setup() {

    window.currentAnnoToolType = 'view';

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

        window.currentAnnoToolType = type;

        enableAnnotateTool(type);

        return false;
    });

    $('.js-tool-btn-span').off('click').on('click', e => {
        $(e.currentTarget).blur();

        const rects = window.iframeWindow.PDFAnnoCore.UI.getRectangles();

        // Check empty.
        if (!rects) {
            return alert('Please select a text span first.');
        }

        // Check duplicated.
        let annos = window.iframeWindow.annotationContainer
                        .getAllAnnotations()
                        .filter(a => a.type === 'span')
                        .filter(a => {
                            console.log('aaaaa:', rects, a);
                            if (rects.length !== a.rectangles.length) {
                                return false;
                            }
                            for (let i = 0; i < rects.length; i++) {
                                if (rects[i].x !== a.rectangles[i].x
                                    || rects[i].y !== a.rectangles[i].y
                                    || rects[i].width !== a.rectangles[i].width
                                    || rects[i].height !== a.rectangles[i].height) {
                                    return false;
                                }
                            }
                            return true;
                        });

        if (annos.length > 0) {
            // Show label input.
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('enableTextInput', true, true, {
                uuid : annos[0].uuid,
                text : annos[0].text
            });
            window.dispatchEvent(event);
            return;
        }

        // Create a new rectAnnotation.
        const anno = window.iframeWindow.PDFAnnoCore.UI.createSpan();

    });

    $('.js-tool-btn-rel').off('click').on('click', e => {

        const $button = $(e.currentTarget);
        const type = $button.data('type');

        let selectedAnnotations = window.iframeWindow.annotationContainer.getSelectedAnnotations();
        selectedAnnotations = selectedAnnotations.filter(a => {
            return a.type === 'area' || a.type === 'span';
        }).sort((a1, a2) => {
            return (a1.selectedTime - a2.selectedTime); // asc
        });

        if (selectedAnnotations.length < 2) {
            return alert('Please select two annotations first.');
        }

        const first  = selectedAnnotations[selectedAnnotations.length - 2];
        const second = selectedAnnotations[selectedAnnotations.length - 1];
        console.log('first:second,', first, second);

        // Check duplicated.
        const arrows = window.iframeWindow.annotationContainer
                        .getAllAnnotations()
                        .filter(a => a.type === 'relation')
                        .filter(a => {
                            return anyOf(a.rel1Annotation.uuid, [first.uuid, second.uuid])
                                    && anyOf(a.rel2Annotation.uuid, [first.uuid, second.uuid])
                        });

        if (arrows.length > 0) {
            console.log('same found!!!');
            // Update!!
            arrows[0].direction = type;
            arrows[0].rel1Annotation = first;
            arrows[0].rel2Annotation = second;
            arrows[0].save();
            arrows[0].render();
            arrows[0].enableViewMode();
            // Show label input.
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('enableTextInput', true, true, {
                uuid : arrows[0].uuid,
                text : arrows[0].text
            });
            window.dispatchEvent(event);
            return;
        }


        window.iframeWindow.PDFAnnoCore.UI.createRelation(type, first, second);

        $button.blur();
    });

}

/**
 * UI parts - Anno List Dropdown.
 */
import { convertToExportY, getPageSize, paddingBetweenPages } from '../../shared/coords';

/**
 * Setup the dropdown for Anno list.
 */
export function setup() {

    // Show the list of primary annotations.
    $('#dropdownAnnoList').on('click', () => {

        // Get displayed annotations.
        let annotations = iframeWindow.annotationContainer.getAllAnnotations();

        // Filter only Primary.
        annotations = annotations.filter(a => {
            return !a.readOnly;
        });

        // Sort by offsetY.
        annotations = annotations.sort((a1, a2) => {
            return _getY(a1) - _getY(a2);
        });

        // Create elements.
        let elements = annotations.map(a => {

            let icon;
            if (a.type === 'span') {
                icon = '<i class="fa fa-pencil"></i>';
            } else if (a.type === 'relation' && a.direction === 'one-way') {
                icon = '<i class="fa fa-long-arrow-right"></i>';
            } else if (a.type === 'relation' && a.direction === 'two-way') {
                icon = '<i class="fa fa-arrows-h"></i>';
            } else if (a.type === 'relation' && a.direction === 'link') {
                icon = '<i class="fa fa-minus"></i>';
            } else if (a.type === 'area') {
                icon = '<i class="fa fa-square-o"></i>';
            }

            let y = _getY(a);
            let { pageNumber } = convertToExportY(y);


            let snipet = `
                <li>
                    <a href="#" data-page="${pageNumber}" data-id="${a.uuid}">
                        ${icon}&nbsp;&nbsp;
                        <span>${a.text || ''}</span>
                    </a>
                </li>
            `;

            return snipet;
        });

        $('#dropdownAnnoList ul').html(elements);

    });

    // Jump to the page that the selected annotation is at.
    $('#dropdownAnnoList').on('click', 'a', e => {

        let id = $(e.currentTarget).data('id');
        let annotation = iframeWindow.annotationContainer.findById(id);

        if (annotation) {

            // scroll to.
            let _y = annotation.y || annotation.y1 || annotation.rectangles[0].y;
            let { pageNumber, y } = convertToExportY(_y);
            console.log('py:', pageNumber, y);
            _y = (iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.height + 12) * (pageNumber - 1) + y * iframeWindow.PDFView.pdfViewer.getPageView(0).viewport.scale;
            _y -= 100;
            $('#viewer iframe').contents().find('#viewer').parent()[0].scrollTop = _y;

            // highlight.
            annotation.highlight();
            setTimeout(() => {
                annotation.dehighlight();
            }, 1000);
        }

        // Close the dropdown.
        $('#dropdownAnnoList').click();
    });

    // Watch the number of primary annos.
    function watchPrimaryAnno(e) {
        const primaryAnnos = iframeWindow.annotationContainer.getAllAnnotations().filter(a => {
            return !a.readOnly;
        });
        $('#dropdownAnnoList .js-count').text(primaryAnnos.length);
    }
    $(window)
        .off('annotationrendered annotationUpdated', watchPrimaryAnno)
        .on('annotationrendered annotationUpdated', watchPrimaryAnno);

}

/**
 * Get the y position in the annotation.
 */
function _getY(annotation) {

    if (annotation.rectangles) {
        return annotation.rectangles[0].y;

    } else if (annotation.y1) {
        return annotation.y1;

    } else {
        return annotation.y;
    }
}




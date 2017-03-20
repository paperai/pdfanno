/**
 * UI parts - Primary Annotation Dropdown.
 */
import { displayAnnotation } from '../util/display';

/**
 * Setup a click action of the Primary Annotation Dropdown.
 */
export function setup() {

    $('#dropdownAnnoPrimary').on('click', 'a', e => {

        let $this = $(e.currentTarget);
        let annoName = $this.find('.js-annoname').text();

        let currentAnnoName = $('#dropdownAnnoPrimary .js-text').text();
        if (currentAnnoName === annoName) {
            console.log('Not reload. the anno are same.');
            return;
        }

        // Confirm to override.
        if (currentAnnoName !== 'Select Anno file') {
            if (!window.confirm('Are you sure to load another Primary Annotation ?')) {
                return;
            }
        }

        $('#dropdownAnnoPrimary .js-text').text(annoName);
        console.log(annoName);

        $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
        $this.find('.fa-check').removeClass('no-visible');

        // if (!fileMap[annoName]) {
        //     return false;
        // }

        // reload.
        displayAnnotation(true);

        // Close
        $('#dropdownAnnoPrimary').click();

        return false;
    });
}

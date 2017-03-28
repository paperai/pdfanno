/**
 * UI parts - Reference Annotation Dropdown.
 */
import { displayAnnotation } from '../util/display';

/**
 * Setup a click action of the Reference Annotation Dropdown.
 */
export function setup() {

    $('#dropdownAnnoReference').on('click', 'a', e => {

        let $this = $(e.currentTarget);

        $this.find('.fa-check').toggleClass('no-visible');

        let annoNames = [];
        $('#dropdownAnnoReference a').each((index, element) => {
            let $elm = $(element);
            if ($elm.find('.fa-check').hasClass('no-visible') === false) {
                annoNames.push($elm.find('.js-annoname').text());
            }
        });
        if (annoNames.length > 0) {
            $('#dropdownAnnoReference .js-text').text(annoNames.join(','));
        } else {
            $('#dropdownAnnoReference .js-text').text('Reference Files');
        }

        displayAnnotation(false);

        return false;

    });

}

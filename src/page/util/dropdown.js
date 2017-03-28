/**
 * Utility functions for dropdown UIs.
 */

export function resetCheckPrimaryAnnoDropdown() {
    $('#dropdownAnnoPrimary .js-text').text('Anno File');
    $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
}

export function resetCheckReferenceAnnoDropdown() {
    $('#dropdownAnnoReference .js-text').text('Reference Files');
    $('#dropdownAnnoReference .fa-check').addClass('no-visible');
}

/**
 * Utility functions for dropdown UIs.
 */

// TODO Need?
export function resetCheckPrimaryAnnoDropdown() {
    $('#dropdownAnnoPrimary .js-text').text('Anno File');
    $('#dropdownAnnoPrimary .fa-check').addClass('no-visible');
}

// TODO Need?
export function resetCheckReferenceAnnoDropdown() {
    $('#dropdownAnnoReference .js-text').text('Reference Files');
    $('#dropdownAnnoReference .fa-check').addClass('no-visible');
}

/**
 * Utility functions for dropdown UIs.
 */

export function resetCheckPrimaryAnnoDropdown() {
    $('#dropdownAnnoPrimary .js-text').text('Select Anno file');
    $('#dropdownAnnoPrimary .fa-check').removeClass('no-visible');
}

export function resetCheckReferenceAnnoDropdown() {
    $('#dropdownAnnoReference .js-text').text('Select reference files');
    $('#dropdownAnnoReference .fa-check').removeClass('no-visible');
}

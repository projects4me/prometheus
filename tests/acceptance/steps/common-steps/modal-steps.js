/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Shared modal helpers for acceptance steps. They work with both `bootstrap-modal` (a `.modal`
 * shown by Bootstrap's plugin) and `AppUi::Modal` (a native `dialog.app-modal`), so step files
 * written against either keep working while screens move from one to the other.
 */

/**
 * Matches the root of either modal; prefix inner selectors with it, e.g.
 * `${MODAL} [data-btn="save"]`.
 */
export const MODAL = ':is(.modal, dialog.app-modal)';

/**
 * Matches an open modal of either kind.
 */
export const OPEN_MODAL = ':is(.modal.in, dialog.app-modal[open])';

/**
 * A selector inside any modal
 *
 * @param {String} inner selector inside the modal
 * @return {String}
 */
export function inModal(inner) {
	return `${MODAL} ${inner}`;
}

/**
 * Whether a modal of either kind is open
 *
 * @return {Boolean}
 */
export function isModalOpen() {
	return Boolean(document.querySelector(OPEN_MODAL));
}

/**
 * Clear modals left over from a previous scenario: Bootstrap backdrops and open dialogs.
 */
export function removeExistingModals() {
	document.querySelectorAll('.modal-backdrop.fade.in').forEach((backdrop) => {
		backdrop.remove();
	});
	document.querySelectorAll('dialog.app-modal[open]').forEach((dialog) => {
		dialog.close();
	});
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Shared modal helpers for acceptance steps, for `AppUi::Modal` (a native `dialog.app-modal`).
 */

/**
 * Matches the root of a modal; prefix inner selectors with it, e.g.
 * `${MODAL} [data-btn="save"]`.
 */
export const MODAL = 'dialog.app-modal';

/**
 * Matches an open modal.
 */
export const OPEN_MODAL = 'dialog.app-modal[open]';

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
 * Whether a modal is open
 *
 * @return {Boolean}
 */
export function isModalOpen() {
	return Boolean(document.querySelector(OPEN_MODAL));
}

/**
 * Clear modals left over from a previous scenario: open dialogs.
 */
export function removeExistingModals() {
	document.querySelectorAll('dialog.app-modal[open]').forEach((dialog) => {
		dialog.close();
	});
}

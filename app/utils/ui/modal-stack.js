/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The open `AppUi::Modal` dialogs in the order they were opened, so the topmost one is known.
 * The document order is not enough: two modals rendered side by side can open in any order.
 *
 * @class ModalStack
 * @namespace Prometheus.Utils.Ui
 * @module Ui
 */
const openDialogs = [];

/**
 * Record a dialog as the topmost open one
 *
 * @method pushModal
 * @param {HTMLDialogElement} dialog
 * @for ModalStack
 */
export function pushModal(dialog) {
    removeModal(dialog);
    openDialogs.push(dialog);
}

/**
 * Forget a dialog that closed or left the page
 *
 * @method removeModal
 * @param {HTMLDialogElement} dialog
 * @for ModalStack
 */
export function removeModal(dialog) {
    let index = openDialogs.indexOf(dialog);
    if (index !== -1) {
        openDialogs.splice(index, 1);
    }
}

/**
 * The topmost open dialog that is still on the page
 *
 * @method topmostModal
 * @return {HTMLDialogElement|null}
 * @for ModalStack
 */
export function topmostModal() {
    for (let i = openDialogs.length - 1; i >= 0; i--) {
        if (openDialogs[i].isConnected && openDialogs[i].open) {
            return openDialogs[i];
        }
    }
    return null;
}

/**
 * Dialogs waiting for the dialog around them to open, with the function that opens each.
 * Child modifiers are installed before their parent's, so a nested modal waits: opening it
 * first would put the parent above it in the top layer.
 */
const pendingOpens = new Map();

/**
 * Open the dialog now, or once the closed dialog around it opens
 *
 * @method openInOrder
 * @param {HTMLDialogElement} dialog
 * @param {Function} open Opens the dialog
 * @for ModalStack
 */
export function openInOrder(dialog, open) {
    let parent = dialog.parentElement?.closest('dialog');
    if (parent && !parent.open) {
        pendingOpens.set(dialog, open);
        return;
    }
    open();
    openPendingInside(dialog);
}

/**
 * Forget a dialog that left the page before it could open
 *
 * @method cancelOpen
 * @param {HTMLDialogElement} dialog
 * @for ModalStack
 */
export function cancelOpen(dialog) {
    pendingOpens.delete(dialog);
}

/**
 * Open the dialogs waiting inside a dialog that just opened, outermost first
 *
 * @method openPendingInside
 * @param {HTMLDialogElement} parent
 * @private
 */
function openPendingInside(parent) {
    for (let child of parent.querySelectorAll('dialog')) {
        let open = pendingOpens.get(child);
        if (open && child.parentElement.closest('dialog') === parent) {
            pendingOpens.delete(child);
            openInOrder(child, open);
        }
    }
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Places a dropdown list inside the modal `<dialog>` its trigger sits in.
 *
 * `showModal()` puts the dialog in the top layer and makes everything outside it inert, so a list
 * drawn at the end of the page shows under the dialog and cannot be clicked, whatever its z-index.
 * The list is rendered into the dialog itself instead. The dialog is a fixed, scrolling layer over
 * the whole viewport (`styles/components/modal.scss`), so a list placed in it with absolute
 * coordinates scrolls with the dialog's content and is not clipped by the visible box.
 *
 * @class DialogDropdown
 * @namespace Prometheus.Utils.Ui
 * @module Ui
 */

/**
 * The open modal dialog that holds the dropdown trigger of the given ember-basic-dropdown, or null
 * when the trigger is not in one.
 *
 * @method openDialogOf
 * @param {String} uniqueId The dropdown's `uniqueId` (the public API's `uniqueId`)
 * @return {HTMLDialogElement|null}
 * @for DialogDropdown
 */
export function openDialogOf(uniqueId) {
    if (!uniqueId) {
        return null;
    }
    let trigger = document.querySelector(`[data-ebd-id="${uniqueId}-trigger"]`);
    return trigger?.closest('dialog[open]') ?? null;
}

/**
 * ember-basic-dropdown `calculatePosition` for a list rendered into a dialog: below the trigger,
 * or above it when there is no room below and there is room above; left-aligned with the trigger,
 * or right-aligned when it would overflow the viewport on the right. Coordinates are relative to
 * the dialog's scrolled content.
 *
 * @method calculateDialogPosition
 * @param {Element} trigger The dropdown trigger
 * @param {Element} content The dropdown content
 * @param {Element} dialog The dialog the content is rendered into
 * @param {Object} options ember-basic-dropdown's options (`matchTriggerWidth`, `verticalPosition`, `previousVerticalPosition`)
 * @return {Object} `{ horizontalPosition, verticalPosition, style }`
 * @for DialogDropdown
 */
export function calculateDialogPosition(trigger, content, dialog, { matchTriggerWidth, verticalPosition, previousVerticalPosition } = {}) {
    let triggerRect = trigger.getBoundingClientRect();
    let dialogRect = dialog.getBoundingClientRect();
    let contentRect = content.getBoundingClientRect();
    let width = matchTriggerWidth ? triggerRect.width : contentRect.width;
    let height = contentRect.height;
    let viewportWidth = document.documentElement.clientWidth;
    let viewportHeight = window.innerHeight;

    let horizontalPosition = 'left';
    let left = triggerRect.left;
    if (left + width > viewportWidth && triggerRect.right - width >= 0) {
        horizontalPosition = 'right';
        left = triggerRect.right - width;
    }

    let roomBelow = triggerRect.bottom + height <= viewportHeight;
    let roomAbove = triggerRect.top - height >= 0;
    let vertical = verticalPosition === 'above' || verticalPosition === 'below' ? verticalPosition : null;
    if (!vertical) {
        if (previousVerticalPosition === 'above' && roomAbove) {
            vertical = 'above';
        } else {
            vertical = !roomBelow && roomAbove ? 'above' : 'below';
        }
    }
    let top = vertical === 'above' ? triggerRect.top - height : triggerRect.bottom;

    let style = {
        left: left - dialogRect.left + dialog.scrollLeft,
        top: top - dialogRect.top + dialog.scrollTop
    };
    if (matchTriggerWidth) {
        style.width = width;
    }
    return { horizontalPosition, verticalPosition: vertical, style };
}

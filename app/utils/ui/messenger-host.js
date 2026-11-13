/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Keeps Messenger's message list usable while a modal `<dialog>` is open.
 *
 * `showModal()` makes everything outside the dialog inert, top-layer popovers included, so a
 * Messenger list in `body` would show under the dialog and could not be clicked. The list is
 * moved into the topmost open dialog instead, and back into `body` when the last one closes.
 * Messenger keeps `body` as its recorded location, so its own calls never move the list back
 * while a dialog is open.
 *
 * @class MessengerHost
 * @namespace Prometheus.Utils.Ui
 * @module Ui
 */

/**
 * Move Messenger's list into the given host, creating the list when it does not exist yet so
 * the first message posted while a dialog is open lands inside it.
 *
 * @method placeMessenger
 * @param {Element|null} host The topmost open dialog, or null for `body`
 * @for MessengerHost
 */
export function placeMessenger(host) {
    let messenger = window.Messenger;
    if (typeof messenger !== 'function') {
        return;
    }
    let list = messenger()?.$el?.[0];
    if (!list) {
        return;
    }
    let target = host || document.body;
    if (list.parentNode !== target) {
        target.prepend(list);
    }
}

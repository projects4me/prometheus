/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { calculateDialogPosition, openDialogOf } from 'prometheus/utils/ui/dialog-dropdown';

/**
 * The only component that renders ember-power-select (see `public/ui-docs/select.md`).
 *
 * When its trigger sits in an open modal `<dialog>` (`AppUi::Modal`), the list is drawn inside
 * that dialog instead of at the end of the page, where the dialog would cover it and make it
 * inert. Callers need no argument for it; `@renderInPlace` still renders the list next to the
 * trigger.
 *
 * @class AppUiSelect
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class AppUiSelectComponent extends Component {

    /**
     * The open dialog the trigger sat in when the list was last opened, or null
     *
     * @property dialog
     * @type HTMLDialogElement
     * @public
     */
    @tracked dialog = null;

    /**
     * Position function for a list drawn inside a dialog; null keeps power-select's default
     *
     * @property calculatePosition
     * @type Function
     * @public
     */
    get calculatePosition() {
        return this.dialog ? calculateDialogPosition : null;
    }

    /**
     * Find the dialog the trigger sits in before the list renders, then let the caller's
     * `@onOpen` decide whether it opens
     *
     * @method handleOpen
     * @param {Object} select power-select's public API
     * @param {Event} event
     * @return {Boolean|undefined} false keeps the list closed
     * @public
     */
    @action
    handleOpen(select, event) {
        let dialog = this.args.renderInPlace ? null : openDialogOf(select?.uniqueId);
        if (dialog !== this.dialog) {
            this.dialog = dialog;
        }
        return this.args.onOpen?.(select, event);
    }
}

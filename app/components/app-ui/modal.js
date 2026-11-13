/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import { modifier } from 'ember-modifier';
import { cancelOpen, openInOrder, pushModal, removeModal, topmostModal } from 'prometheus/utils/ui/modal-stack';
import { placeMessenger } from 'prometheus/utils/ui/messenger-host';

/**
 * A modal dialog on the native `<dialog>` element, opened with `showModal()` as soon as it is
 * rendered. Callers keep `{{#if this.showX}}` around it and clear the flag in `@onClose`;
 * removing it from the page closes it.
 *
 * `@confirm` decides whether the modal closes after Confirm is clicked: returning `true` closes
 * it, anything else leaves it open. When it returns a Promise the modal is busy until the
 * Promise settles: the buttons are disabled, Confirm shows a spinner and Esc and backdrop clicks
 * are ignored. It closes when the Promise resolves truthy and stays open, with its buttons
 * enabled again, when it resolves falsy or rejects.
 *
 * @class AppUiModal
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class AppUiModalComponent extends Component {

    /**
     * Whether a confirm returning a Promise is still running
     *
     * @property busy
     * @type Boolean
     * @public
     */
    @tracked busy = false;

    /**
     * The dialog element, set once it is on the page
     *
     * @property dialog
     * @type HTMLDialogElement
     * @private
     */
    dialog = null;

    /**
     * The element a pointer press started on, so a drag from the content that ends on the
     * backdrop does not close the modal
     *
     * @property pressTarget
     * @type Element
     * @private
     */
    pressTarget = null;

    /**
     * Id of the title, for `aria-labelledby`
     *
     * @property titleId
     * @type String
     * @public
     */
    get titleId() {
        return `${guidFor(this)}-title`;
    }

    /**
     * Open the dialog when it is rendered and wire Esc, backdrop clicks and closing. On teardown
     * the dialog leaves the stack without calling `@onClose`: the caller removed it.
     *
     * @method setupDialog
     * @private
     */
    setupDialog = modifier((dialog) => {
        this.dialog = dialog;
        let onCancel = (event) => this.handleCancel(event);
        let onClose = () => this.handleClose();
        let onPointerDown = (event) => { this.pressTarget = event.target; };
        let onClick = (event) => this.handleBackdropClick(event);

        dialog.addEventListener('cancel', onCancel);
        dialog.addEventListener('close', onClose);
        dialog.addEventListener('pointerdown', onPointerDown);
        dialog.addEventListener('click', onClick);

        // A modal nested in another opens after it, so it stacks above it
        openInOrder(dialog, () => {
            if (!dialog.open) {
                dialog.showModal();
            }
            pushModal(dialog);
            placeMessenger(topmostModal());
        });

        return () => {
            dialog.removeEventListener('cancel', onCancel);
            dialog.removeEventListener('close', onClose);
            dialog.removeEventListener('pointerdown', onPointerDown);
            dialog.removeEventListener('click', onClick);
            cancelOpen(dialog);
            if (dialog.open) {
                dialog.close();
            }
            removeModal(dialog);
            placeMessenger(topmostModal());
            this.dialog = null;
        };
    });

    /**
     * Esc: close through the same path as Cancel, or not at all while busy
     *
     * @method handleCancel
     * @param {Event} event
     * @private
     */
    handleCancel(event) {
        event.preventDefault();
        this.requestClose();
    }

    /**
     * A click whose press and release are both on the dialog itself is a backdrop click: the
     * dialog fills the viewport and the visible box is its `.modal-dialog` child.
     *
     * @method handleBackdropClick
     * @param {MouseEvent} event
     * @private
     */
    handleBackdropClick(event) {
        let startedOnBackdrop = this.pressTarget === null || this.pressTarget === this.dialog;
        this.pressTarget = null;
        if (event.target === this.dialog && startedOnBackdrop) {
            this.requestClose();
        }
    }

    /**
     * The dialog closed: leave the stack and tell the caller
     *
     * @method handleClose
     * @private
     */
    handleClose() {
        if (this.dialog) {
            removeModal(this.dialog);
        }
        placeMessenger(topmostModal());
        if (this._isGone()) {
            return;
        }
        this.busy = false;
        this.args.onClose?.();
    }

    /**
     * Close the dialog unless a confirm is running; the close event then calls `@onClose`
     *
     * @method requestClose
     * @public
     */
    @action
    requestClose() {
        if (this.busy || this._isGone() || !this.dialog?.open) {
            return;
        }
        this.dialog.close();
    }

    /**
     * The optional left footer button (`@leftLabel`, `@leftAction`): run its action, then close
     *
     * @method onLeft
     * @public
     */
    @action
    onLeft() {
        if (this.busy) {
            return;
        }
        this.args.leftAction?.();
        this.requestClose();
    }

    /**
     * Run `@confirm` and close, stay open or wait for its Promise
     *
     * @method onConfirm
     * @return {Promise|undefined}
     * @public
     */
    @action
    onConfirm() {
        if (this.busy || typeof this.args.confirm !== 'function') {
            return;
        }
        let result = this.args.confirm();
        if (result && typeof result.then === 'function') {
            this.busy = true;
            return Promise.resolve(result).then(
                (value) => this._settle(Boolean(value)),
                () => this._settle(false)
            );
        }
        if (result === true) {
            this.requestClose();
        }
    }

    /**
     * Finish a busy confirm: close when it succeeded, otherwise enable the buttons again.
     * The caller may already have removed the modal.
     *
     * @method _settle
     * @param {Boolean} succeeded Whether the confirm Promise resolved truthy
     * @private
     */
    _settle(succeeded) {
        if (this._isGone()) {
            return;
        }
        this.busy = false;
        if (succeeded) {
            this.requestClose();
        }
    }

    /**
     * Whether the component is being or has been torn down
     *
     * @method _isGone
     * @return {Boolean}
     * @private
     */
    _isGone() {
        return isDestroying(this) || isDestroyed(this);
    }
}

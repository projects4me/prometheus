/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import jQuery from 'jquery'

/**
 * This component is used used for the control the bootstrap modal
 *
 * The passed in `confirm` decides whether the modal hides after the confirm button is clicked:
 * returning `true` hides it, anything else leaves it open. When it returns a Promise the modal
 * is busy until the Promise settles: Confirm and Cancel are disabled, Confirm shows a spinner and
 * repeated clicks are ignored. The modal hides when the Promise resolves truthy and stays open,
 * with its buttons enabled again, when it resolves falsy or rejects.
 *
 * @class BootstrapModal
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * Whether a confirm returning a Promise is still running
     *
     * @property busy
     * @type Boolean
     * @for BootstrapModal
     * @public
     */
    busy: false,

    /**
     * Show the modal, keep it open while busy and call `close` once it is hidden
     *
     * @method didInsertElement
     * @private
     */
    didInsertElement() {
        this._super(...arguments);
        this._modal().modal().on('hide.bs.modal', (event) => {
            // Esc and backdrop clicks must not abandon a running confirm
            if (this.busy) {
                event.preventDefault();
            }
        }).on('hidden.bs.modal', () => {
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.set('busy', false);
            if (typeof this.close === 'function') {
                this.close();
            }
        });
    },

    /**
     * Stop listening to the modal before it leaves the page
     *
     * @method willDestroyElement
     * @private
     */
    willDestroyElement() {
        this._modal().off('hide.bs.modal hidden.bs.modal');
        this._super(...arguments);
    },

    /**
     * The modal element of this component
     *
     * @method _modal
     * @return {jQuery}
     * @private
     */
    _modal() {
        return jQuery(this.element).find('.modal').first();
    },

    /**
     * Hide the modal, the hidden.bs.modal handler then calls `close`
     *
     * @method _hide
     * @private
     */
    _hide() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        this._modal().modal('hide');
    },

    /**
     * Finish a busy confirm: hide the modal when it succeeded, otherwise keep it open and
     * enable the buttons again. The caller may already have removed the modal.
     *
     * @method _settle
     * @param {Boolean} succeeded Whether the confirm Promise resolved truthy
     * @private
     */
    _settle(succeeded) {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        this.set('busy', false);
        if (succeeded) {
            this._hide();
        }
    },

    /**
     * These are the actions supported by this components
     *
     * @property actions
     * @type Object
     * @for BootstrapModal
     * @public
     */
    actions: {

        /**
         * This action is captures the confirm button and send it forward to be
         * handled by the controller
         *
         * @method confirm
         * @public
         */
        confirm: function() {
            if (this.busy) {
                return;
            }
            let result = this.confirm();
            if (result && typeof result.then === 'function') {
                this.set('busy', true);
                return Promise.resolve(result).then(
                    (value) => this._settle(Boolean(value)),
                    () => this._settle(false)
                );
            }
            if (result === true) {
                this._hide();
            }
        }
    },

});

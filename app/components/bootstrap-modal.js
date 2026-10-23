/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import jQuery from 'jquery'

/**
 * This component is used used for the control the bootstrap modal
 *
 * @class BootstrapModal
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * Show the modal
     *
     * @method show
     * @private
     */
    didRender() {
        let _self = this;
        jQuery('.modal').modal().on('hidden.bs.modal', () => {
            _self.close();
        });
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
            let _self = this;
            if (_self.confirm()) {
                jQuery('.modal').modal('hide');
            }
        }
    },

});

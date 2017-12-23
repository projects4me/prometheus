/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This component is used used for the control the bootstrap modal
 *
 * @class BootstrapModal
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * Show the modal
     *
     * @method show
     * @private
     */
    show: function() {
        this.$('.modal').modal().on('hidden.bs.modal', function() {
            this.sendAction('close');
        }.bind(this));
    }.on('didRender'),

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
            this.$('.modal').modal('hide');
            this.sendAction('confirm');
        }
    },

});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';

/**
 * This class adds the functionality of dropdown action menu in the system
 * In order to allow capturing of an event of any specified name we are passing
 * all incoming actions over to the controller.
 *
 * @class ActionMenu
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The events that this component is listing to
     *
     * @property actions
     * @type Object
     * @for ActionMenu
     * @public
     */
    actions: {

        /**
         * Allowing capture of all possible event and simply forwarding them
         *
         * @method onAction
         * @param {String} action delegate the specified event over to the controller
         * @public
         */
        onAction:function(action) {
            this.sendAction(action);
        }
    },
});

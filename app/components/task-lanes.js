/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This class adds the functionality of task lanes
 *
 * @class TaskLanes
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * This function is used to initialize the sortable behavior
     *
     * @method didInsertElement
     * @for TaskLanes
     * @protected
     */
    didInsertElement(){
        Ember.$('.board .lane .box-body').sortable({
            placeholder         : 'sort-highlight',
            connectWith         : '.board .lane .box-body',
            //handle              : '.item',
            forcePlaceholderSize: true,
            zIndex              : 999999
        });
       // Ember.$('.board .lane .box-body .item').css('cursor', 'move');
    },

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

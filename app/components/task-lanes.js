/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import $ from 'jquery';

/**
 * This class adds the functionality of task lanes
 *
 * @class TaskLanes
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * This function is used to initialize the sortable behavior
     *
     * @method didInsertElement
     * @for TaskLanes
     * @protected
     */
    didInsertElement(){
        let self = this;

        $('.board .lane .box-body').sortable({
            placeholder         : 'sort-highlight',
            connectWith         : '.board .lane .box-body',
            //handle              : '.item',
            forcePlaceholderSize: true,
            zIndex              : 999999,
            update: function(event,ui) {
                self._update(event,ui);
            }
        });
       // Ember.$('.board .lane .box-body .item').css('cursor', 'move');
    },

    _update(event, ui){
        let currentStatus = ui.item.attr('data-field-issue-status');
        let newStatus = event.target.previousElementSibling.getAttribute('data-field-status');
        Logger.debug(ui);

        if (currentStatus !== newStatus)
        {
            this.update(ui.item.attr('data-field-issue-id'),newStatus,ui.item.attr('data-field-issue-milestone'));
        }

    }

});

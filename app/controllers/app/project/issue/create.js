/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

/**
 * This is the controller for issue create page
 *
 * @class Create
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Controller.extend({

    /**
     * These are the events that this controller handles
     *
     * @property actions
     * @type Object
     * @for Create
     * @public
     */
    actions:{

        /**
         * This function is called when an assignee is being selected
         *
         * @method selectAssignee
         * @param {Object} target
         * @public
         */
        selectAssignee:function(target)
        {
            Logger.debug('App.Project.Issue.Create:selectAssignee');
            var model = this.get('model');
            model.set('assignee',target.value);
            Logger.debug('App.Project.Issue.Create:selectAssignee');
        },

        /**
         * This function is called when an owner is being selected
         *
         * @method selectOwner
         * @param {Object} target
         * @public
         */
        selectOwner:function(target)
        {
            Logger.debug('App.Project.Issue.Create:selectOwner');
            var model = this.get('model');
            model.set('owner',target.value);
            Logger.debug('App.Project.Issue.Create:selectOwner');
        },

        /**
         * This function is called when an milestone is being selected
         *
         * @method selectMilestone
         * @param {Object} target
         * @public
         */
        selectMilestone:function(target)
        {
            Logger.debug('App.Project.Issue.Create:selectMilestone');
            var model = this.get('model');
            model.set('milestoneId',target.value);
            Logger.debug('App.Project.Issue.Create:selectMilestone');
        },

    }
});

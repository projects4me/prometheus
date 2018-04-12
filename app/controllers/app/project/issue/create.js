/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { inject } from '@ember/service';

/**
 * This is the controller for issue create page
 *
 * @class Create
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Controller.extend({


    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for Create
     * @public
     */
    currentUser: inject('current-user'),

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for Create
     * @public
     */
    i18n: inject(),

    /**
     * This property is used to control the enabling and disabling of the save
     * button, the save is only enabled if the current model has been modified
     *
     * @property saveDisabled
     * @type String
     * @for Create
     * @private
     */
    saveDisabled: null,

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

        /**
         * This function is called when the status is being selected
         *
         * @method selectStatus
         * @param {Object} target
         * @public
         */
        selectStatus:function(target)
        {
            Logger.debug('App.Project.Issue.Create:selectStatus');
            var model = this.get('model');
            model.set('status',target.value);
            Logger.debug('App.Project.Issue.Create:selectStatus');
        },

        /**
         * This function is called when the priority is being selected
         *
         * @method selectPriority
         * @param {Object} target
         * @public
         */
        selectPriority:function(target)
        {
            Logger.debug('App.Project.Issue.Create:selectPriority');
            var model = this.get('model');
            model.set('priority',target.value);
            Logger.debug('App.Project.Issue.Create:selectPriority');
        },

        /**
         * This function is called when the issue type is being selected
         *
         * @method selectType
         * @param {Object} target
         * @public
         */
        selectType:function(target)
        {
            Logger.debug('App.Project.Issue.Create:selectType');
            let model = this.get('model');
            model.set('typeId',target.value);
            Logger.debug('App.Project.Issue.Create:selectType');
        },

        /**
         * This function is called when the start date field is changed
         *
         * @method startDateChanged
         * @param {String} date
         * @public
         */
        startDateChanged(date) {
            Logger.debug('Prometheus.App.Project.Issue.Edit.Controller::startDateChanged('+date+')');
            if (this.get('model') !== undefined) {
                this.get('model').set('startDate', date);
            }
            Logger.debug('Prometheus.App.Project.Issue.Edit.Controller::startDateChanged');
        },

        /**
         * This function is called when the end date field is changed
         *
         * @method endDateChanged
         * @param {String} date
         * @public
         */
        endDateChanged(date) {
            Logger.debug('Prometheus.App.Project.Issue.Edit.Controller::endDateChanged('+date+')');
            if (this.get('model') !== undefined) {
                this.get('model').set('endDate', date);
            }
            Logger.debug('Prometheus.App.Project.Issue.Edit.Controller::endDateChanged');
        },

        /**
         * This function is responsible for saving the model. After successfully
         * saving the function takes the user to the saved page.
         *
         * @method save
         * @public
         * @todo Trigger the notificaiton
         */
        save:function() {
            let self = this;
            let model = this.get('model');

            model.set('projectId',this.target.currentState.routerJs.state.params["app.project"].project_id);
            model.set('reportedUser',self.get('currentUser.user.id'));
            model.set('deleted','0');

            model.set('startDate',moment(model.get('startDate')).format("YYYY-MM-DD"));
            model.set('endDate',moment(model.get('endDate')).format("YYYY-MM-DD"));

            model.save().then(function(data){


                new Messenger().post({
                    message: self.get('i18n').t('views.app.issue.created',{name:data.get('subject'),issue_number:data.get('issueNumber')}),
                    type: 'success',
                    showCloseButton: true
                });

                self.transitionToRoute('app.project.issue.page', {project_id:data.get('projectId'),issue_number:data.get('issueNumber')});
            });
        },

        /**
         * This function lets a user traverse to the issue list view of the project
         *
         * @method cancel
         * @public
         * @todo Trigger the notificaiton
         */
        cancel:function(){
            let model = this.get('model');
            this.transitionToRoute('app.project.issue', {project_id:model.get('projectId')});
        },
    }
});

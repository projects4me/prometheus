/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

/**
 * This is the controller for issue create page
 *
 * @class Edit
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Controller.extend({


    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for Create
     * @public
     */
    currentUser: Ember.inject.service(),

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for Create
     * @public
     */
    i18n: Ember.inject.service(),

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
            var model = this.get('model');
            model.set('typeId',target.value);
            Logger.debug('App.Project.Issue.Create:selectType');
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
            var self = this;
            var model = this.get('model');

            model.projectId = this.target.currentState.routerJs.state.params["app.project"].projectId;
            //model.dateCreated = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            model.dateModified = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            model.modifiedUser = self.get('currentUser.user.id');
            //model.reportedUser = self.get('currentUser.user.id');
            //model.createdUser = self.get('currentUser.user.id');
            model.modifedUserName = self.get('currentUser.user.name');
            //model.createdUserName = self.get('currentUser.user.name');
            //model.deleted = '0';
            model.startDate = moment(model.get('startDate'),'MMMM D, YYYY').format("YYYY-MM-DD");
            model.endDate= moment(model.get('endDate'),'MMMM D, YYYY').format("YYYY-MM-DD");

            Logger.debug(model);
            Logger.debug(self);
            model.save().then(function(data){
                Logger.debug('Data saved:');
                Logger.debug(data);

                new Messenger().post({
                    message: self.get('i18n').t('view.app.issue.created',{name:data.get('subject'),issueNumber:data.get('issueNumber')}),
                    type: 'success',
                    showCloseButton: true
                });

                self.transitionToRoute('app.project.issue.page', {projectId:data.get('projectId'),issueNumber:data.get('issueNumber')});
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
            var model = this.get('model');
            this.transitionToRoute('app.project.issue', {projectId:model.get('projectId')});
        },
    }
});

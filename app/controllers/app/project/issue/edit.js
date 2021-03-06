/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";
import { inject } from '@ember/service';
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';
import format from "../../../../utils/data/format";

/**
 * This is the controller for issue create page
 *
 * @class Edit
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Prometheus.extend({

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
     * This is the controller of the project, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property projectController
     * @type Prometheus.Controllers.App.Project
     * @for Edit
     * @public
     */
    projectController: injectController('app.project'),

    /**
     * This is a computed property in which gets the list of issues
     * associated with a project loaded by the project controller
     *
     * @property issuesList
     * @type Array
     * @for Edit
     * @private
     */
    issuesList: computed('projectController.issuesList', function(){
        return this.get('projectController').get('issuesList');
    }),

    /**
     * This is the controller for the app, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property appController
     * @type Prometheus.Controllers.App.Project
     * @for Edit
     * @public
     */
    appController: injectController('app'),

    /**
     * This members for this project
     *
     * @property memberList
     * @type Array
     * @for Edit
     * @public
     */
    memberList: computed('project', function(){
        return format.getSelectList(this.get('project.members'));
    }),

    /**
     * This milestones available for this project
     *
     * @property milestoneList
     * @type Array
     * @for Edit
     * @public
     */
    milestoneList: computed('project', function(){
        return format.getSelectList(this.get('project.milestones'));
    }),

    /**
     * This issue types available for the project
     *
     * @property typeList
     * @type Array
     * @for Edit
     * @public
     */
    typeList: computed('types', function(){
        return format.getSelectList(this.get('types'));
    }),

    /**
     * This is a computed property in which gets the list of user
     * associated in the system fetched by the app controller
     *
     * @property usersList
     * @type Array
     * @for Edit
     * @private
     */
    usersList: computed('appController.usersList', function(){
        return this.get('appController').get('usersList');
    }),

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
         * @todo we should be able able to delegate this to the select component
         */
        selectAssignee:function(target)
        {
            Logger.debug('App.Project.Issue.Create:selectAssignee');
            let model = this.get('model');
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
            let model = this.get('model');
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
            let model = this.get('model');
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
            let model = this.get('model');
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
            let model = this.get('model');
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
         * @todo Trigger the notification
         */
        save:function() {
            let _self = this;
            let model = this.get('model');

            model.validate().then(({ validations }) => {

                if (validations.get('isValid')) {
                    model.set('projectId', this.target.currentState.routerJs.state.params["app.project"].project_id);

                    model.save().then(function(data){

                        new Messenger().post({
                            message: _self.get('i18n').t('views.app.issue.updated',{name:data.get('subject'),issue_number:data.get('issueNumber')}),
                            type: 'success',
                            showCloseButton: true
                        });

                        _self.transitionToRoute('app.project.issue.page', {project_id:data.get('projectId'),issue_number:data.get('issueNumber')});
                    });

                } else {
                    let messages = _self._buildMessages(validations);

                    new Messenger().post({
                        message: messages,
                        type: 'error',
                        showCloseButton: true
                    });
                }
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
            let _self = this;
            let model = _self.get('model');

            _self.transitionToRoute('app.project.issue.page', {project_id:model.get('projectId'),issue_number:model.get('issueNumber')});
        },

        /**
         * This is the action that is called by summernote
         * A separate action is created as we are trying to follow
         * the data down action up approach
         *
         * @method onContentChange
         * @param contents
         * @private
         */
        onContentChange:function (contents) {
            Logger.debug('Prometheus.App.Project.Edit.onContentChange');
            let _self = this;
            _self.get('model').set('description',contents);
            -Logger.debug('Prometheus.App.Project.Edit.onContentChange');
        },
    }
});

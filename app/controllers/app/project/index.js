/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import format from "../../../utils/data/format";
import _ from "lodash";
import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { inject as injectController } from '@ember/controller';
import { computed } from '@ember/object';

/**
 * This is the index page of the project, index page for the project is
 * basically the detail page for it.
 *
 * @class Index
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Controller.extend({

    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for Index
     * @public
     */
    currentUser: inject('current-user'),

    /**
     * The internationalization service
     *
     * @property i18n
     * @type Ember.Service
     * @for Index
     * @public
     */
    i18n: inject(),

    /**
     * This flag is used to show or hide the modal dialog box
     * for adding new members
     *
     * @property addTagDialog
     * @type bool
     * @for Index
     * @private
     */
    addMemberDialog: false,

    /**
     * This flag is used to show or hide the modal dialog box
     * for editing milestones
     *
     * @property milestoneDialog
     * @type bool
     * @for Index
     * @private
     */
    milestoneDialog: false,

    /**
     * This field stores the selected role in the add member dialog
     *
     * @property selectedRole
     * @type int
     * @for Index
     * @public
     */
    selectedRole: null,

    /**
     * This field stores the selected user in the add member dialog
     *
     * @property selectedUser
     * @type int
     * @for Index
     * @public
     */
    selectedUser: null,

    /**
     * We are injecting the app controller as it contains the system
     * roles, users and projects
     *
     * @property appController
     * @type Prometheus.App.Controller
     * @for Index
     * @private
     */
    appController: injectController('app'),

    /**
     * This is the list of roles fetched by the app controller
     *
     * @property rolesList
     * @type array
     * @for Index
     * @private
     */
    rolesList: computed(function(){
        return this.get('appController.rolesList');
    }),

    /**
     * This is the list of users fetched by the app controller
     *
     * @property usersList
     * @type array
     * @for Index
     * @private
     */
    usersList: computed('model', 'model.members', function(){
        let _self = this;
        let currentMembers = format.getSelectList(_self.get('model.members'));
        let usersList = _self.get('appController.usersList');

        return (_.differenceWith(usersList,currentMembers,_.isEqual));
    }),

    milestoneTypes : [
        {"label":"Milestone","value":"milestone"},
        {"label":"Version","value":"version"},
        {"label":"Patch","value":"patch"},
        {"label":"Release","value":"release"},
        {"label":"Sprint","value":"sprint"},
    ],

    milestoneStatuses : [
        {"label":"Completed","value":"completed"},
        {"label":"Closed","value":"closed"},
        {"label":"In Progress","value":"in_progress"},
        {"label":"Planned","value":"planned"},
        {"label":"Complete","value":"complete"},
        {"label":"Overdue","value":"overdue"},
        {"label":"Deferred","value":"deferred"},
        {"label":"Failed","value":"failed"},
    ],

    /**
     * These are the actions that we are going to handle for this controller
     *
     * @property actions
     * @type Object
     * @for Index
     * @public
     */
    actions: {

        /**
         * This action is used to allow navigation to a user to a project related
         * page
         *
         * @method navigateToProjectPage
         * @param {String} entity This is the entity the user wants to navigate to
         * @param {String} query The params passed in the format of encoded URL string
         * @public
         */
        navigateToProjectPage(entity,query){
            Logger.debug("AppProjectIndexController::navigateToProjectPage("+entity+","+query+")");
            this.transitionToRoute('app.project.'+entity,{project_id:this.get('projectId')});
        },

        /**
         * This action is used to allow navigation to a user to a project related
         * page
         *
         * @method navigateToProjectPage
         * @param {String} entity This is the entity the user wants to navigate to
         * @param {String} query The params passed in the format of encoded URL string
         * @public
         */
        navigateToIssuePage(issueNumber){
            Logger.debug("AppProjectIndexController::navigateToIssuePage("+issueNumber+")");
            this.transitionToRoute('app.project.issue.page',{project_id:this.get('projectId'), issue_number:issueNumber});
        },

        /**
         * This action is used to navigate the user to the project's edit page
         *
         * @method editProject
         * @param {String} projectId
         * @public
         */
        editProject(projectId){
            Logger.debug('Prometheus.App.Projects.Edit::editProject('+projectId+')');
            this.transitionToRoute('app.projects.edit',{project_id:projectId});
            Logger.debug('-Prometheus.App.Projects.Edit::editProject');
        },

        /**
         * This method is used to set the selectedRole property
         *
         * @method selectRole
         * @param role
         * @public
         */
        selectRole(role){
            Logger.debug('Prometheus.App.Project.Controller->selectRole');
            this.set('selectedRole',role.value);
            Logger.debug('-Prometheus.App.Project.Controller->selectRole');
        },

        /**
         * This method is used to set the selectedUser property
         *
         * @method selectUser
         * @param user
         * @public
         */
        selectUser(user){
            Logger.debug('Prometheus.App.Project.Controller->selectUser');
            this.set('selectedUser',user.value);
            Logger.debug('-Prometheus.App.Project.Controller->selectUser');
        },

        /**
         * This function is used to add a new member to the project
         *
         * @method addTag
         */
        addMember(){
            Logger.debug('AppProjectIndexController:addMember');
            let _self = this;
            Logger.debug(_self);

            let _selectedRole = _self.get('selectedRole');
            let _selectedUser = _self.get('selectedUser');

            if (_selectedUser !== null && _selectedRole !== null) {
                let membership = _self.get('store').createRecord('membership', {
                    roleId: _self.get('selectedRole'),
                    userId: _self.get('selectedUser'),
                    projectId: _self.get('model.id'),
                });

                let role = _self.get('store').peekRecord('role',_selectedRole);
                let user = _self.get('store').peekRecord('user',_selectedUser);

                // Add membership to the system
                membership.save().then(function (data) {
                    _self.get('model.memberships').pushObject(data);

                    // Create a dummy record of roles and push in model.roles
                    _self.get('model.roles').pushObject(role);
                    // Add a dummy record of users and push in model.members
                    _self.get('model.members').pushObject(user);

                    _self.set('selectedUser', null);
                    new Messenger().post({
                        message: _self.get('i18n').t("views.app.project.detail.membership.added",{role:role.get('name'),user:user.get('name')}),
                        type: 'success',
                        showCloseButton: true
                    });
                });
            } else  {
                new Messenger().post({
                    message: _self.get('i18n').t("views.app.project.detail.membership.missing"),
                    type: 'error',
                    showCloseButton: true
                });
            }

            _self.send('removeAddMemberModal');
            Logger.debug('-AppProjectIndexController:addMember');
        },

        /**
         * This function is called when the milestone type is
         * being selected
         *
         * @method selectMilestoneType
         * @param {Object} target
         * @public
         */
        selectMilestoneType(target)
        {
            Logger.debug('Prometheus.Controllers.Project.Index::selectMileStoneType');
            this.set('newMilestone.milestoneType',target.value);
            Logger.debug('-Prometheus.Controllers.Project.Index::selectMileStoneType');
        },

        /**
         * This function is called when the milestone status is
         * being selected
         *
         * @method selectMilestoneStatus
         * @param {Object} target
         * @public
         */
        selectMilestoneStatus(target)
        {
            Logger.debug('Prometheus.Controllers.Project.Index::selectMileStoneStatus');
            this.set('newMilestone.status',target.value);
            Logger.debug('-Prometheus.Controllers.Project.Index::selectMileStoneStatus');
        },

        /**
         * This function is called when the start date field is changed
         *
         * @method milestoneStartDateChanged
         * @param {String} date
         * @public
         */
        milestoneStartDateChanged(date) {
            Logger.debug('Prometheus.Controllers.Project.Index::startDateChanged('+date+')');
            if (this.get('newMilestone') !== undefined) {
                this.get('newMilestone').set('startDate', date);
            }
            Logger.debug('Prometheus.Controllers.Project.Index::startDateChanged');
        },

        /**
         * This function is called when the end date field is changed
         *
         * @method milestonEndDateChanged
         * @param {String} date
         * @public
         */
        milestoneEndDateChanged(date) {
            Logger.debug('Prometheus.Controllers.Projects.Index::endDateChanged('+date+')');
            if (this.get('newMilestone') !== undefined) {
                this.get('newMilestone').set('endDate', date);
            }
            Logger.debug('Prometheus.Controllers.Projects.Index::endDateChanged');
        },


        /**
         * This function is used to save a milestone
         *
         * @method saveMilestone
         * @public
         * @todo validate milestone information
         */
        saveMilestone(){
            Logger.debug('Prometheus.Controllers.Project.Index::saveMilestone');
            let _self = this;
            let newMilestone = _self.get('newMilestone');
            Logger.debug(_self);

            if (newMilestone.get('name') !== null
                && newMilestone.get('startDate') !== null
                && newMilestone.get('endDate') !== null
                && newMilestone.get('typeDate') !== null
                && newMilestone.get('statusDate') !== null) {

                newMilestone.set('projectId',_self.get('model.id'));

                // Add milestone to the system
                newMilestone.save().then(function (data) {

                    if (newMilestone.get('id') === undefined) {
                        _self.get('milestones').pushObject(newMilestone);

                    }

                    new Messenger().post({
                        message: _self.get('i18n').t("views.app.project.detail.milestone.added",{name:data.get('name')}),
                        type: 'success',
                        showCloseButton: true
                    });
                });
            } else  {
                new Messenger().post({
                    message: _self.get('i18n').t("views.app.project.detail.milestone.missing"),
                    type: 'error',
                    showCloseButton: true
                });
            }

            _self.send('removeMilestoneDialog');
            Logger.debug('-Prometheus.Controllers.Project.Index::saveMilestone');
        },

        /**
         * This function is used to edit the milestone dialog box
         *
         * @method editMilestone
         * @public
         */
        editMilestone(milestone)
        {
            let _self = this;
            _self.set('newMilestone',milestone);
            _self.set('milestoneDialog',true);
        },

        /**
         * This function is used to show the add members dialog box
         *
         * @method showDialog
         * @public
         */
        showAddMemberDialog()
        {
            this.set('addMemberDialog',true);
        },

        /**
         * This function is used to hide the add tag modal
         *
         * @method removeAddMemberModal
         * @public
         */
        removeAddMemberModal(){
            this.set('addMemberDialog',false);
        },

        /**
         * This function is used to show the milestone dialog box
         *
         * @method showMilestoneDialog
         * @public
         */
        showMilestoneDialog()
        {
            let _self = this;
            let newMilestone = _self.get('store').createRecord('milestone');
            _self.set('newMilestone',newMilestone);
            _self.set('milestoneDialog',true);
        },

        /**
         * This function is used to hide the milestone dialog
         *
         * @method removeMilestoneDialog
         * @public
         */
        removeMilestoneDialog(){
            let _self = this;

            if (_self.get('newMilestone.id') !== undefined){
                _self.get('milestones').findBy('id',_self.get('newMilestone.id')).rollbackAttributes();
            }

            _self.set('milestoneDialog',false);
        }


    }

});
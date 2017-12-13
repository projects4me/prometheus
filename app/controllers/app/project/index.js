/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import format from "../../../utils/data/format";
import _ from "lodash";

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
export default Ember.Controller.extend({

    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for Index
     * @public
     */
    currentUser: Ember.inject.service(),

    /**
     * The internationalization service
     *
     * @property i18n
     * @type Ember.Service
     * @for Index
     * @public
     */
    i18n: Ember.inject.service(),

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
    appController: Ember.inject.controller('app'),

    /**
     * This is the list of roles fetched by the app controller
     *
     * @property rolesList
     * @type array
     * @for Index
     * @private
     */
    rolesList: Ember.computed(function(){
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
    usersList: Ember.computed(function(){
        let _self = this;
        let currentMembers = format.getSelectList(_self.get('model.members'));
        let usersList = _self.get('appController.usersList');

        return (_.differenceWith(usersList,currentMembers,_.isEqual));
    }).property('model','model.members'),

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
        navigateToProjectPage:function(entity,query){
            Logger.debug("AppProjectIndexController::navigateToProjectPage("+entity+","+query+")");
            this.transitionToRoute('app.project.'+entity,{projectId:this.get('projectId')});
        },

        /**
         * This method is used to set the selectedRole property
         *
         * @method selectRole
         * @param role
         * @public
         */
        selectRole:function(role){
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
        selectUser:function(user){
            Logger.debug('Prometheus.App.Project.Controller->selectUser');
            this.set('selectedUser',user.value);
            Logger.debug('-Prometheus.App.Project.Controller->selectUser');
        },

        /**
         * This function is used to add a new member to the project
         *
         * @method addTag
         */
        addMember:function(){
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
                    dateCreated: 'CURRENT_DATETIME',
                    dateModified: 'CURRENT_DATETIME',
                    createdUser: _self.get('currentUser.user.id'),
                    modifiedUser: _self.get('currentUser.user.id'),
                    deleted: 0
                });

                let rolesList = _self.get('rolesList');
                let usersList = _self.get('usersList');

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
                        message: _self.get('i18n').t("view.app.project.detail.membership.added",{role:role.get('name'),user:user.get('name')}),
                        type: 'success',
                        showCloseButton: true
                    });
                });
            } else  {
                new Messenger().post({
                    message: _self.get('i18n').t("view.app.project.detail.membership.missing"),
                    type: 'error',
                    showCloseButton: true
                });
            }

            _self.send('removeAddMemberModal');
            Logger.debug('-AppProjectIndexController:addMember');
        },
        /**
         * This function is used to show the add modal dialog box
         *
         * @method showDialog
         * @public
         */
        showAddMemberDialog:function()
        {
            this.set('addMemberDialog',true);
        },

        /**
         * This function is used to hide the add tag modal
         *
         * @method removeModal
         * @public
         */
        removeAddMemberModal:function(){
            this.set('addMemberDialog',false);
        }

    }

});
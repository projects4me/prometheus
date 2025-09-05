/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import format from "../../../utils/data/format";
import _ from "lodash";
import { inject as controller } from '@ember/controller';
import { computed, action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import $ from "jquery";
import { htmlSafe } from "@ember/template";

/**
 * This is the index page of the project, index page for the project is
 * basically the detail page for it.
 *
 * @class AppProjectIndexController
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectIndexController extends PrometheusCreateController {

    /**
     * This object holds all of the information that we need to create our schema and also need to 
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for AppProjectConversationController
     * @private
     */
    metadata = {
        sections: [
            {
                name: "memberDelete",
                fields: [
                    {
                        name: "reAssignIssues",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }
    
    /**
     * Query params that the controller support.
     *
     * @property queryParams
     * @type Array
     * @for AppProjectIndexController
     * @public
     */
    queryParams = ['s_id'];

    /**
     * This function is called on the initialization of the controller. In this function
     * we're calling setupSchema method in order to generate schema, by analyzing metadata
     * defined in the controller, that will be used to validate the form of the template.
     *
     * @method constructor
     * @public
     */    
    constructor() {
        super(...arguments);
        this.setupSchema();
    }    

    /**
     * This flag is used to show or hide the modal dialog box
     * for adding new members
     *
     * @property addTagDialog
     * @type bool
     * @for Index
     * @private
     */
    addMemberDialog = false;

    /**
     * This flag is used to show or hide the modal dialog box
     * for editing existing member.
     *
     * @property addMemberDialog
     * @type bool
     * @for Index
     * @private
     */
    @tracked editMemberDialog = false;
    
    /**
     * This field is used to show or hide the modal dialog box
     * for deleting a member
     *
     * @property deleteMemberDialog
     * @type bool
     * @for Index
     * @private
     */
    @tracked deleteMemberDialog = false;
    
    /**
     * Selected user to reassign issues after member deletion
     * @property selectedNewIssuesAssignee 
     * @type Object
     * @for Index
     * @public
     */
    @tracked selectedNewIssuesAssignee = null;

    /**
     * This flag is used to show or hide the modal dialog box
     * for editing milestones
     *
     * @property milestoneDialog
     * @type bool
     * @for Index
     * @private
     */
    milestoneDialog = false;

    /**
     * This field stores the selected role in the add/edit member dialog.
     *
     * @property selectedRole
     * @type int
     * @for Index
     * @public
     */
    @tracked selectedRole = null;

    /**
     * This field stores the selected user in the edit member dialog.
     *
     * @property selectedUser
     * @type string
     * @for Index
     * @public
     */
    @tracked selectedUser = null;    

    /**
     * This field stores the selected users in the add members dialog
     *
     * @property selectedUser
     * @type array
     * @for Index
     * @public
     */
    @tracked selectedUsers = [];

    /**
     * We are injecting the app controller as it contains the system
     * roles, users and projects
     *
     * @property appController
     * @type Prometheus.App.Controller
     * @for Index
     * @private
     */
    @controller('app') appController;

    /**
     * This is the list of roles fetched by the app controller
     *
     * @property rolesList
     * @type array
     * @for Index
     * @private
     */
    @tracked rolesList = this.appController.rolesList;

    /**
     * This is the list of users fetched by the app controller
     *
     * @property usersList
     * @type array
     * @for Index
     * @private
     */
    @computed('model', 'model.members')
    get usersList() {
        let currentMembers = this.currentMembers;
        let usersList = this.get('appController.usersList');
        return (_.differenceWith(usersList, currentMembers, _.isEqual));
    }

    /**
     * This is the list of members in the project formatted to be used by 
     * the field relate component.
     * 
     * @property currentMembers
     * @for Index
     * @public
     */
    get currentMembers() {
        return (new format(this)).getSelectList(this.get('model.members'));
    }

    /**
     * Returns list of project members excluding the selected member.
     * Used for reassigning issues when deleting a member.
     * 
     * @property otherMembers
     * @for Index
     * @public 
     */
    get otherMembers() {
        let members = this.currentMembers;
        return members.filter(member => member.value !== this.selectedUser?.id);
    }

    milestoneTypes = [
        { "label": "Milestone", "value": "milestone" },
        { "label": "Version", "value": "version" },
        { "label": "Patch", "value": "patch" },
        { "label": "Release", "value": "release" },
        { "label": "Sprint", "value": "sprint" },
    ];

    milestoneStatuses = [
        { "label": "Completed", "value": "completed" },
        { "label": "Closed", "value": "closed" },
        { "label": "In Progress", "value": "in_progress" },
        { "label": "Planned", "value": "planned" },
        { "label": "Complete", "value": "complete" },
        { "label": "Overdue", "value": "overdue" },
        { "label": "Deferred", "value": "deferred" },
        { "label": "Failed", "value": "failed" },
    ];

    /**
     * This action is used to allow navigation to a user to a project related
     * page
     *
     * @method navigateToProjectPage
     * @param {String} entity This is the entity the user wants to navigate to
     * @param {String} query The params passed in the format of encoded URL string
     * @public
     */
    @action navigateToProjectPage(entity, query) {
        Logger.debug("AppProjectIndexController::navigateToProjectPage(" + entity + "," + query + ")");
        this.transitionToRoute('app.project.' + entity, { shortcode: this.trackedProject.shortCode });
    }

    /**
     * This action is used to allow navigation to a user to a project related
     * page
     *
     * @method navigateToProjectPage
     * @param {String} entity This is the entity the user wants to navigate to
     * @param {String} query The params passed in the format of encoded URL string
     * @public
     */
    @action navigateToIssuePage(issueNumber) {
        Logger.debug("AppProjectIndexController::navigateToIssuePage(" + issueNumber + ")");
        this.transitionToRoute('app.project.issue.page', { shortcode: this.trackedProject.shortCode, issue_number: issueNumber });
    }

    /**
     * This action is used to navigate the user to the project's edit page
     *
     * @method editProject
     * @param {String} projectShortCode
     * @public
     */
    @action editProject(projectShortCode) {
        Logger.debug('Prometheus.App.Projects.Edit::editProject(' + projectShortCode + ')');
        this.transitionToRoute('app.projects.edit', projectShortCode);
        Logger.debug('-Prometheus.App.Projects.Edit::editProject');
    }

    /**
     * This method is used to set the selectedRole property
     *
     * @method selectRole
     * @param role
     * @public
     */
    @action selectRole(role) {
        Logger.debug('Prometheus.App.Project.Controller->selectRole');
        this.set('selectedRole', role.value);
        Logger.debug('-Prometheus.App.Project.Controller->selectRole');
    }

    /**
     * This function is used to add a new member to the project
     *
     * @method addMembers
     */
    @action addMembers() {
        Logger.debug('AppProjectIndexController:addMembers');
        let _self = this;

        let selectedRole = _self.get('selectedRole');
        let selectedUsers = _self.get('selectedUsers');

        if (selectedUsers !== null && selectedRole !== null) {
            let role = _self.get('store').peekRecord('role', selectedRole);

            selectedUsers.forEach(function (selectedUser) {
                let user = _self.get('store').peekRecord('user', selectedUser.value);

                let membership = _self.get('store').createRecord('membership', {
                    roleId: role.id,
                    userId: user.id,
                    projectId: _self.model.id,
                    relatedTo: 'project',
                    relatedId: _self.projectId
                });

                // Add membership to the system
                membership.save().then(function (data) {
                    _self.get('model.memberships').pushObject(data);

                    // Create a dummy record of roles and push in model.roles
                    _self.get('model.roles').pushObject(role);
                    // Add a dummy record of users and push in model.members
                    _self.get('model.members').pushObject(user);

                    new Messenger().post({
                        message: htmlSafe(_self.intl.t("views.app.project.detail.membership.added", { role: role.get('name'), user: user.get('name') })),
                        type: 'success',
                        showCloseButton: true
                    });
                });
            });

            _self.selectedUsers = [];
            _self.selectedRole = null;
        } else {
            new Messenger().post({
                message: _self.intl.t("views.app.project.detail.membership.missing"),
                type: 'error',
                showCloseButton: true
            });
        }

        _self.send('removeAddMemberModal');
        Logger.debug('-AppProjectIndexController:addMembers');
    }

    /**
     * This function is called when the milestone type is
     * being selected
     *
     * @method selectMilestoneType
     * @param {Object} target
     * @public
     */
    @action selectMilestoneType(target) {
        Logger.debug('Prometheus.Controllers.Project.Index::selectMileStoneType');
        this.set('newMilestone.milestoneType', target.value);
        Logger.debug('-Prometheus.Controllers.Project.Index::selectMileStoneType');
    }

    /**
     * This function is called when the milestone status is
     * being selected
     *
     * @method selectMilestoneStatus
     * @param {Object} target
     * @public
     */
    @action selectMilestoneStatus(target) {
        Logger.debug('Prometheus.Controllers.Project.Index::selectMileStoneStatus');
        this.set('newMilestone.status', target.value);
        Logger.debug('-Prometheus.Controllers.Project.Index::selectMileStoneStatus');
    }

    /**
     * This function is called when the start date field is changed
     *
     * @method milestoneStartDateChanged
     * @param {String} date
     * @public
     */
    @action milestoneStartDateChanged(date) {
        Logger.debug('Prometheus.Controllers.Project.Index::startDateChanged(' + date + ')');
        if (this.newMilestone !== undefined) {
            this.newMilestone.set('startDate', date);
        }
        Logger.debug('Prometheus.Controllers.Project.Index::startDateChanged');
    }

    /**
     * This function is called when the end date field is changed
     *
     * @method milestonEndDateChanged
     * @param {String} date
     * @public
     */
    @action milestoneEndDateChanged(date) {
        Logger.debug('Prometheus.Controllers.Projects.Index::endDateChanged(' + date + ')');
        if (this.newMilestone !== undefined) {
            this.newMilestone.set('endDate', date);
        }
        Logger.debug('Prometheus.Controllers.Projects.Index::endDateChanged');
    }


    /**
     * This function is used to save a milestone
     *
     * @method saveMilestone
     * @public
     * @todo validate milestone information
     */
    @action saveMilestone() {
        Logger.debug('Prometheus.Controllers.Project.Index::saveMilestone');
        let _self = this;
        let newMilestone = _self.get('newMilestone');

        let isUpdate = (newMilestone.get('id') != undefined);

        if (newMilestone.get('name') !== null
            && newMilestone.get('startDate') !== null
            && newMilestone.get('endDate') !== null
            && newMilestone.get('typeDate') !== null
            && newMilestone.get('statusDate') !== null) {

            newMilestone.set('projectId', _self.get('model.id'));

            // Add milestone to the system
            newMilestone.save().then(function (data) {
                if (!isUpdate) {
                    _self.get('milestones').pushObject(data);
                }

                new Messenger().post({
                    message: htmlSafe(_self.intl.t("views.app.project.detail.milestone.added", { name: data.get('name') })),
                    type: 'success',
                    showCloseButton: true
                });
            });
        } else {
            new Messenger().post({
                message: _self.intl.t("views.app.project.detail.milestone.missing"),
                type: 'error',
                showCloseButton: true
            });
        }

        _self.send('removeMilestoneDialog');
        Logger.debug('-Prometheus.Controllers.Project.Index::saveMilestone');
    }

    /**
     * This function is used to edit the milestone dialog box
     *
     * @method editMilestone
     * @public
     */
    @action editMilestone(milestone, event) {
        let _self = this;
        _self.set('newMilestone', milestone);
        _self.set('milestoneDialog', true);
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * This function is used to show the add members dialog box
     *
     * @method showDialog
     * @public
     */
    @action showAddMemberDialog() {
        this.set('addMemberDialog', true);
    }

    /**
     * This function is used to show the edit member dialog box.
     *
     * @method showEditMemberDialog
     * @public
     */
    @action showEditMemberDialog(member) {
        let _self = this;
        this.editMemberDialog = true;
        this.selectedUser = member;
        let role = this.appController.roles.filterBy('id',_self.model.memberships.filterBy('userId',member.id)[0]?.get('roleId'));
        this.selectedRole = role[0].id;
    }

    /**
     * This function is used to show the delete member dialog box.
     *
     * @method showDeleteMemberDialog
     * @public
     */
    @action showDeleteMemberDialog(member) {
        this.deleteMemberDialog = true;
        this.selectedUser = member;
    }

    /**
     * This function is used to hide the delete member modal.
     *
     * @method removeDeleteMemberModal
     * @public
     */
    @action removeDeleteMemberModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.deleteMemberDialog = false;
        this.selectedNewIssuesAssignee = null;
        $('.modal').modal('hide');
    }

    /**
     * This property returns the model for the member delete form.
     * 
     * @property reAssignIssuesModel
     */
    get reAssignIssuesModel() {
        return {
            reAssignIssues: this.selectedNewIssuesAssignee?.value
        }
    }

    /**
     * Deletes a member from the project and reassigns their issues to another user.
     * 
     * @returns {Promise} Resolves when the member is successfully deleted, rejects on validation failure or error
     * @method deleteMember
     * @throws Will throw an error if the deletion fails
     */
    @action deleteMember() {
        return new Promise((resolve, reject) => {
            this.validate(this.reAssignIssuesModel, "memberDelete").then(async (validation) => {
                if (validation.isValid) {
                    let memberships = await this.model.memberships;
                    let membership = memberships.find((membership) => membership.userId === this.selectedUser.id);
                    let _self = this;
            
                    try {
                        membership.deleteRecord();
                        await membership.save({             
                            adapterOptions: {
                                queryParams: {
                                    newAssigneeId: this.selectedNewIssuesAssignee.value
                                }
                            }
                        });
            
                        this.model.memberships = this.model.memberships.filter((membership) => membership.userId !== this.selectedUser.id);
                        this.model.members = this.model.members.filter((member) => member.id !== this.selectedUser.id);
                        this.removeDeleteMemberModal();
            
                        new Messenger().post({
                            message: htmlSafe(this.intl.t("views.app.project.detail.membership.deleted", { user: this.selectedUser.name})),
                            type: 'success',
                            showCloseButton: true
                        });
                        resolve();
                    } catch(error) {
                        _self.errorManager.handleError(error);
                        reject();
                    }
                } else {
                    this._showError(validation.errors, "project");
                    reject();
                }
            });
        });
    }
    
    /**
     * This function is used to hide the edit member modal.
     *
     * @method removeEditMemberModal
     * @public
     */
    @action removeEditMemberModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.set('editMemberDialog', false);
        $('.modal').modal('hide');
        this.selectedRole = null;
    }    

    /**
     * This function is used to hide the add tag modal
     *
     * @method removeAddMemberModal
     * @public
     */
    @action removeAddMemberModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.set('addMemberDialog', false);
        $('.modal').modal('hide');
        this.selectedRole = null;
    }

    /**
     * This function is used to show the milestone dialog box
     *
     * @method showMilestoneDialog
     * @public
     */
    @action showMilestoneDialog() {
        let _self = this;
        _self.send('resetNewMilestone');
        _self.set('milestoneDialog', true);
    }

    /**
     * This function is used to hide the milestone dialog
     *
     * @method removeMilestoneDialog
     * @public
     */
    @action removeMilestoneDialog() {
        let _self = this;

        if (_self.get('newMilestone.id') !== undefined) {
            _self.get('newMilestone').rollbackAttributes();
        }

        _self.send('resetNewMilestone');
        _self.set('milestoneDialog', false);
        $('.modal').modal('hide');
    }

    /**
     * This function is used to reset the newMilestone
     *
     * @method resetNewMilestone
     * @public
     */
    @action resetNewMilestone() {
        let _self = this;

        let newMilestone = _self.get('store').createRecord('milestone', {
            startDate: moment().format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD'),
        });

        _self.set('newMilestone', newMilestone);
    }
    
    /**
     * This function is used to update member's role in the project.
     * 
     * @method updateMember
     * @public
     */
    @action 
    async updateMember() {
        let membership = this.model.memberships.find((membership) => membership.userId === this.selectedUser.id);
        let _self = this;
        
        if(membership.roleId !== this.selectedRole) {
            let role = this.store.peekRecord('role', this.selectedRole);

            membership.roleId = role.id;

            try {
                await membership.save();

                this.model.memberships = this.model.memberships.map((membership) => {
                    if(membership.userId === this.selectedUser.id) {
                        membership.roleId = role.id;
                    }
                    return membership;
                });

                new Messenger().post({
                    message: htmlSafe(this.intl.t("views.app.project.detail.membership.updated", { role: role.get('name'), user: this.selectedUser.name})),
                    type: 'success',
                    showCloseButton: true
                });
            this.removeEditMemberModal();
            } catch (error) {
                _self.errorManager.handleError(error);
            }
        }
    }

    /**
     * Gets the warning message for deleting a project member
     * @type {SafeString}
     * @readonly
     * @returns {SafeString} A localized HTML-safe string containing the delete warning message with the selected user's name
     */
    get deleteMemberWarning() {
        return htmlSafe(this.intl.t("views.app.project.detail.membership.deleteWarning", { user: this.selectedUser.name }));
    }

    /**
     * This action is used to scroll to the comment.
     *
     * @method scrollToComment
     * @public
     */
    @action scrollToElement(element, type) {
        let selectors = {
            'milestone': {
                'selector': `[data-milestone-id="${this.s_id}"]`,
                'spread': '0.9rem',
                'blur': '0.4rem'
            },
        }
        let el = element.querySelector(selectors[type].selector);
        this.scrollAndHighlight(el, true, {
            spread: selectors[type]?.spread,
            blur: selectors[type]?.blur
        });
    }
}

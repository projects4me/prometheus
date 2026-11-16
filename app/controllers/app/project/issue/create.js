/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import { inject as controller } from '@ember/controller';
import { computed, action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import format from "prometheus/utils/data/format";
import _ from "lodash";
import * as dates from 'prometheus/utils/date';
import { toArray } from 'prometheus/utils/array/to-array';

/**
 * This is the controller for issue create page
 *
 * @class AppProjectIssueCreateController
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends ProjectRelatedController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectIssueCreateController extends ProjectRelated {

    /**
     * This object holds all of the information that we need to create our schema and also need to 
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for AppProjectIssueCreateController
     * @protected
     */
    metadata = {
        sections: [
            {
                name: "issueCreate",
                fields: [
                    {
                        name: "subject",
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
                    },
                    {
                        name: "typeId",
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
                    },
                    {
                        name: "assignee",
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
                    },
                    {
                        name: "owner",
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
                    },
                    {
                        name: "statusId",
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
                    },
                    {
                        name: "priority",
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
                    },
                    {
                        name: "startDate",
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
                    },
                    {
                        name: "endDate",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    },
                                    {
                                        name: "test",
                                        value: [
                                            'end-date-greater-than-start-date',
                                            this.intl.t(
                                                'views.app.issue.create.validations.endDateGreaterThanStartDate'
                                            ),
                                            function(value) {
                                                const endDate = new Date(value);
                                                const startDate = new Date(this.parent.startDate);
                                                return endDate > startDate;
                                            }
                                        ]
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
     * This is the module for which we are trying to create
     *
     * @property module
     * @type String
     * @for Create
     * @protected
     */
    module = 'issue';

    /**
     * The query parameters of the create page: `fromThread` is the id of the discussion the issue is created from
     *
     * @property queryParams
     * @type Array
     * @public
     */
    queryParams = ['fromThread'];

    /**
     * The id of the discussion the issue is created from, or null
     *
     * @property fromThread
     * @type String
     * @public
     */
    @tracked fromThread = null;

    /**
     * The discussion the issue is created from (set by the route), or null. Once the issue is saved the thread is
     * linked to it and the user goes back to the thread.
     *
     * @property sourceThread
     * @type Prometheus.Models.Conversationroom
     * @public
     */
    @tracked sourceThread = null;

    /**
     * This is the controller for the app, we are injecting it in order to
     * gain access to the data that is fetched by this controller
     *
     * @property appController
     * @type Prometheus.Controllers.App.Project
     * @for Create
     * @public
     */
    @controller('app') appController;

    /**
     * This milestones available for this project
     *
     * @property milestoneList
     * @type Array
     * @for Create
     * @public
     */
    @computed('project.milestones.[]')
    get milestoneList() {
        let milestones = toArray(this.project?.milestones).sort((a, b) => (a.dateCreated > b.dateCreated) - (a.dateCreated < b.dateCreated)).reverse();
        let blankPlaceholder = this.intl.t('views.app.milestone.lists.type.backlog');
        return (new format(this)).getSelectList(milestones, false, {isRequired: true, placeholder: blankPlaceholder});
    }

    /**
     * This issue types available for the project
     *
     * @property typeList
     * @type Array
     * @for Create
     * @public
     */
    @computed('types')
    get typeList() {
        return (new format(this)).getIssueTypeList(this.types);
    }

    /**
     * This issue statuses available for the project
     *
     * @property issueStatusList
     * @type Array
     * @for Create
     * @public
     */
    @computed('statuses')
    get issueStatusList() {
        return (new format(this)).getIssueStatusList(this.statuses);
    }

    /**
     * This is a computed property in which gets the list of user
     * associated in the system fetched by the app controller
     *
     * @property usersList
     * @type Array
     * @for Create
     * @private
     */
    @computed('appController.usersList')
    get usersList() {
        return this.appController.get('usersList');
    }

    /**
     * Active project members list for assignment fields.
     * Invited and inactive users are intentionally excluded.
     *
     * @property activeMembersList
     * @type Array
     * @public
     */
    get activeMembersList() {
        let members = toArray(this.project?.members);
        let activeMembers = members.filter((member) => member?.accountStatus === 'active');
        return (new format(this)).getSelectList(activeMembers);
    }

    /**
     * The agents of the system, to tell which members are agents and who they run for.
     *
     * @property agents
     * @type Array
     * @public
     */
    agents = [];

    /**
     * Active members grouped for the assignee picker: People, then Agents. An agent option carries
     * `isAgent` and the name of the sponsor it runs for. An empty group is left out.
     *
     * @property assigneeGroups
     * @type Array
     * @public
     */
    get assigneeGroups() {
        return this.assigneeGroupsFor(this.activeMembersList);
    }

    /**
     * The options of `assigneeGroups` as one flat list, to find the selected option in.
     *
     * @property assigneeOptions
     * @type Array
     * @public
     */
    get assigneeOptions() {
        return this.assigneeGroups.flatMap((group) => group.options);
    }

    /**
     * Splits member options into the People and Agents groups.
     *
     * @method assigneeGroupsFor
     * @param {Array} options the member options
     * @return {Array}
     * @private
     */
    assigneeGroupsFor(options) {
        let sponsors = new Map((this.agents ?? []).map((agent) => [String(agent.userId), agent.sponsor?.name ?? null]));
        let people = [];
        let agents = [];

        for (let option of options) {
            let member = toArray(this.project?.members).find((m) => m.id === option.value);
            if (member?.type === 'agent') {
                agents.push({ ...option, isAgent: true, sponsorName: sponsors.get(String(option.value)) ?? null });
            } else {
                people.push(option);
            }
        }

        return [
            { groupName: this.intl.t('views.app.issue.create.people'), options: people },
            { groupName: this.intl.t('views.app.issue.create.agents'), options: agents }
        ].filter((group) => group.options.length > 0);
    }

    /**
     * This estimates for this issue
     *
     * @property estimates
     * @type Array
     * @for Create
     * @private
     */
    estimates = [];

    /**
     * This function sets the model properties before saving it
     *
     * @method beforeSave
     * @param model
     */
    beforeSave(model) {
        model.set('reportedUser', this.currentUser.user.id);
        model.set('startDate', dates.format(model.get('startDate'), "YYYY-MM-DD"));
        model.set('endDate', dates.format(model.get('endDate'), "YYYY-MM-DD"));
    }

    /**
     * This function returns the success message
     *
     * @method getSuccessMessage
     * @param model
     */
    getSuccessMessage(model) {
        return this.intl.t('views.app.issue.created', {
            name: model.get('subject'),
            issueNumber: model.get('issueNumber'), htmlSafe: true });
    }

    /**
     * This function navigates a user back to the thread the issue was created from, or to the issue detail page
     *
     * @method navigateToSuccess
     * @param model
     */
    navigateToSuccess(model) {
        if (this.sourceThread) {
            this.router.transitionTo('app.project.conversation.page', this.sourceThread.id);
            return;
        }
        this.router.transitionTo('app.project.issue.page', model.get('issueNumber'));
    }

    /**
     * Links the thread the issue was created from to the saved issue: sets the thread's issueId and issueNumber (the
     * same fields the edit modal sets) and saves it. A failed save rolls the thread back and rethrows, so the base
     * class shows the error; the issue itself stays saved.
     *
     * @method afterSave
     * @param {Prometheus.Models.Issue} model the saved issue
     * @return {Promise}
     * @protected
     */
    async afterSave(model) {
        let room = this.sourceThread;
        if (!room) {
            return;
        }
        room.issueId = model.id;
        room.issueNumber = model.issueNumber;
        try {
            await room.save();
        } catch (error) {
            room.rollbackAttributes();
            throw error;
        }
        room.issue = model;
    }

    /**
     * This function checks if a field has changed
     *
     * @method _save
     * @param model
     * @protected
     */
    hasChanged(model) {
        return (_.size(model.changedAttributes()) > 2);
    }

    /**
     * This function navigates a user back to the thread the issue was started from, or to the issue list view.
     *
     * @method afterCancel
     * @param projectId
     * @protected
     */
    afterCancel() {
        if (this.sourceThread) {
            this.router.transitionTo('app.project.conversation.page', this.sourceThread.id);
            return;
        }
        this.router.transitionTo('app.project.issue', {  shortcode: this.trackedProject.shortCode });
    }

    /**
     * Selected parent issue option for the PowerSelect (id, name, number, status).
     *
     * @property selectedParentIssue
     * @type {Object|null}
     * @public
     */
    @tracked selectedParentIssue = null;

    /**
     * Task to load issue options for the Parent dropdown. Queries issues in the current project.
     *
     * @property parentIssueSearch
     * @type {Task}
     * @public
     */
    parentIssueSearch = task(async (query) => {
        await timeout(300);
        let projectId = this.project?.id;
        if (!projectId) return [];
        let baseQuery = `((Issue.projectId : ${projectId}) AND (Issue.issueNumber !: ${this.model.issueNumber}))`;
        let searchClause = query && String(query).trim()
            ? ` AND ((Issue.issueNumber CONTAINS ${query}) OR (Issue.subject CONTAINS ${query}) OR (Issue.description CONTAINS ${query}))`
            : '';
        let options = {
            query: baseQuery + searchClause,
            limit: 10,
            sort: 'Issue.issueNumber',
            order: 'DESC'
        };
        let data = await this.store.query('issue', options);
        let map = {
            id: 'id',
            name: 'subject',
            number: 'issueNumber',
            status: 'status',
            project: 'project'
        };
        return (new format(this)).getSelectList(data, map);
    });

    /**
     * Sets the parent issue from the PowerSelect selection.
     *
     * @method setParentIssue
     * @param {Object|null} option Option with id, name, number, status
     * @public
     */
    @action setParentIssue(option) {
        this.selectedParentIssue = option;
        this.model.parentId = option ? option.id : null;
        this.model.parentissue = option ? this.store.peekRecord('issue', option.id) : null;
    }

    /**
     * This function is used to set the parent issue as selected
     * @method setParentIssueAsSelected
     * @public
     */
    @action async setParentIssueAsSelected() {
        let parentissue = await this.model.parentissue;
        if(parentissue) {
            this.selectedParentIssue = {
                id: parentissue.id,
                name: parentissue.subject,
                number: parentissue.issueNumber,
                status: parentissue.status
            };
        } else {
            this.selectedParentIssue = null;
        }
    }

    /**
     * This function is used to select the milestone for the issue
     * and set the end date for the issue.
     *
     * @method selectMilestone
     * @param model
     * @param field
     */
    @action selectMilestone(model, field, target) {
        model.set(field, target.value);

        this.project.milestones.forEach((milestone) => {
            if (milestone.id === target.value) {
                model.set('endDate', milestone.endDate);
            }
        });
    }

    /**
     * This function checks if the form has unsaved changes that should block navigation.
     *
     * @method isDirty
     * @return {boolean}
     * @public
     */
    get isDirty() {
        let dirtyFns = {
            'edit' : 'isEditDirty',
            'create' : 'isCreateDirty',
        }
        if (!this.model) {
            return false;
        }

        return this[dirtyFns[this.layoutName]](this.model);
    }

    /**
     * This function checks if the model has changed for edit layout
     *
     * @method isEditDirty
     * @param model
     * @return {boolean}
     * @public
     */
    isEditDirty(model) {
        return _.size(model.changedAttributes()) > 0;
    }

    /**
     * This function checks if the model has changed for create layout
     *
     * @method isCreateDirty
     * @param model
     * @return {boolean}
     * @public
     */
    isCreateDirty(model) {
        let modelKeys = _.keys(model.changedAttributes());
        let dirtyFields = ['subject', 'description', 'typeId', 'milestoneId'];
        let cantEmptyFields = ['description', 'subject'];

        cantEmptyFields.forEach(field => {
            if (modelKeys.includes(field) && model[field] === '') {
                modelKeys.splice(modelKeys.indexOf(field), 1);
            }
        });

        return modelKeys.some(key => dirtyFields.includes(key));
    }
}

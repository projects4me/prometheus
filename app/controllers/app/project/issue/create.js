/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import { inject as controller } from '@ember/controller';
import { computed, action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import format from "prometheus/utils/data/format";
import _ from "lodash";
import { htmlSafe } from '@ember/template';

/**
 * This is the controller for issue create page
 *
 * @class AppProjectIssueCreateController
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends PrometheusCreateController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectIssueCreateController extends PrometheusCreateController.extend(ProjectRelated) {

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
    @computed('project.milestones')
    get milestoneList() {
        let milestones = this.project.milestones.sortBy('dateCreated').reverse();
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
        return (new format(this)).getSelectList(this.types);
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
        return (new format(this)).getTranslatedModelList(this.statuses, 'views.app.issue.lists.status');
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
        let members = this.project?.members ?? [];
        let activeMembers = members.filter((member) => member?.accountStatus === 'active');
        return (new format(this)).getSelectList(activeMembers);
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
        model.set('startDate', moment(model.get('startDate')).format("YYYY-MM-DD"));
        model.set('endDate', moment(model.get('endDate')).format("YYYY-MM-DD"));
    }

    /**
     * This function returns the success message
     *
     * @method getSuccessMessage
     * @param model
     */
    getSuccessMessage(model) {
        return htmlSafe(this.intl.t('views.app.issue.created', {
            name: model.get('subject'),
            issueNumber: model.get('issueNumber')
        }));
    }

    /**
     * This function navigate a user to the issue detail page
     *
     * @method navigateToSuccess
     * @param model
     */
    navigateToSuccess(model) {
        this.transitionToRoute('app.project.issue.page', model.get('issueNumber'));
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
     * This function navigates a use to the issue list view.
     *
     * @method afterCancel
     * @param projectId
     * @protected
     */
    afterCancel() {
        this.transitionToRoute('app.project.issue', {  shortcode: this.trackedProject.shortCode });
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
    @(task(function* (query) {
        yield timeout(300);
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
        let data = yield this.store.query('issue', options);
        let map = {
            id: 'id',
            name: 'subject',
            number: 'issueNumber',
            status: 'status',
            project: 'project'
        };
        return (new format(this)).getSelectList(data, map);
    })) parentIssueSearch;

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
     * This function checks if the model has changed
     *
     * @method isDirty
     * @return {boolean}
     * @public
     */
    get isDirty() {
        return (_.size(this.model.changedAttributes()) > 6 || this.model.description !== '');
    }
}

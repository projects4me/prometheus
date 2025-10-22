/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import { computed, action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {inject as controller } from '@ember/controller';
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";

/**
 * This is the controller for the board controller
 *
 * @class AppProjectBoardController
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */export default class AppProjectBoardController extends PrometheusCreateController.extend(ProjectRelated) {

    /**
     * This object holds all of the information that we need to create our schema and also need to 
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for AppProjectBoardController
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
            },
            {
                name: "milestoneCreate",
                fields: [
                    {
                        name: "name",
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
                                                'views.app.milestone.create.validations.endDateGreaterThanStartDate'
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
                    },
                    {
                        name: "milestoneType",
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
                        name: "status",
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
    };

    /**
     * The project controller
     *
     * @property projectController
     * @type Ember.Service
     * @for AppProjectBoardController
     */
    @controller('app.project') projectController;

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
     * These are the query params that the controller supports.
     *
     * @property queryParams
     * @type Array
     * @for Board
     */
    queryParams = ['query', 'searchId'];

    /**
     * These are the issues statues
     *
     * @property statuses
     * @type Array
     * @for Board
     * @public
     */
    statusClass = {
        new: 'box-info',
        in_progress: 'box-primary',
        in_review: 'box-info',
        done: 'box-success',
        feedback: 'box-warning',
        pending: 'box-danger',
        deferred: ''
    };

    /**
     * These are the issues statues
     *
     * @property statuses
     * @type Array
     * @for Board
     * @public
     */
    originalIssues = null;


    /**
     * This is the query that is used to filter the issues.
     *
     * @property query
     * @type String
     * @for Board
     */
    @tracked query = '';

    /**
     * This is the ID of the selected saved search.
     *
     * @property searchId
     * @type String
     * @for Board
     */
    @tracked searchId = null;

    /**
     * The currently selected issue for displaying in the sidebar
     *
     * @property selectedIssue
     * @type Object
     * @for Board
     */
    @tracked selectedIssue = null;

    /**
     * The full issue details loaded for the selected issue
     *
     * @property selectedIssueDetails
     * @type Object
     * @for Board
     */
    @tracked selectedIssueDetails = null;

    /**
     * The issue types for the project
     *
     * @property issueTypes
     * @type Array
     * @for Board
     */
    @tracked issueTypes = [];

    /**
     * Loading state for issue details
     *
     * @property isLoadingIssueDetails
     * @type Boolean
     * @for Board
     */
    @tracked isLoadingIssueDetails = false;

    /**
     * These are the actions supported by the Project Board View
     *
     * @property actions
     * @type Object
     * @for Board
     * @public
     */

    /**
     * This action is used to help navigate a user to the detail view of an issue
     *
     * @method openIssue
     * @param App.Model.Issue issue The issue the user wants to navigate to
     * @public void
     */
    @action openIssue(issue) {
        Logger.debug("AppProjectBoardController::openIssue");
        this.transitionToRoute('app.project.issue.page', issue.issueNumber);
        Logger.debug("-AppProjectBoardController::openIssue");
    }

    /**
     * This function is responsible for updating the status of an issue
     *
     * @method updateIssue
     * @param {HTMLElement} issueEl The issue element that is dragged
     * @param {HTMLElement} elTo Lane from which issue is dragged
     * @param {HTMLElement} elFrom Lane on which issue is dropped
     * @param {Function} reRenderViewCb
     * @public
     */
    @action updateIssue(issueEl, elTo, elFrom, reRenderViewCb) {
        Logger.debug("AppProjectBoardController::updateIssue");
        Logger.debug('The element that was dragged is', issueEl);
        let _self = this;
        let laneMilestoneId = elTo.getAttribute('data-field-milestone-id');
        let status = elTo.parentElement.children[0].getAttribute('data-field-status');
        let newStatusId = elTo.getAttribute('data-issue-status-id');
        let issueId = issueEl.getAttribute('data-field-issue-id');
        let issueMilestoneId = issueEl.getAttribute('data-field-issue-milestone');

        (issueMilestoneId == "") && (issueMilestoneId = null);
        let milestone = this.milestones.findBy('id', issueMilestoneId);
        let issue = milestone.issues.findBy('id', issueId);
        let targetMilestone = this.milestones.findBy('id', laneMilestoneId);
        targetMilestone.issues.pushObject(issue);

        issue.set('status', status);
        issue.set('milestoneId', laneMilestoneId);
        issue.set('statusId', newStatusId);
        issue.save().then(() => {
            _self.postUpdateProcessing(issueId, elTo, elFrom, reRenderViewCb);
        });
        Logger.debug("-AppProjectBoardController::updateIssue");
    }

    /**
     * This function is used in order to check whether the two milestone containers, from which our issue
     * item is dragged and dropped, are same or not. If these two milestone containers are same,
     * then we should have to only adjust the height of one parent container only. And if
     * they are not same, meaning that the item is dragged from one milestone box
     * and dropped into some other milestone box, then we should have to adjust/recalculate the height
     * of both milestone containers. After that applying slim scroll to updated issue item. All of the re adjusting
     * of heights and applying slimscroll is done by the callback 'reRenderViewCb'.
     * @method postUpdateProcessing
     * @param {String} issueId Id of updated issue
     * @param {HTMLElement} elTo Lane from which issue is dragged
     * @param {HTMLElement} elFrom Lane on which issue is dropped
     * @param {Function} reRenderViewCb 
     * @public
     */
    postUpdateProcessing(issueId, elTo, elFrom, reRenderViewCb) {
        Logger.debug("AppProjectBoardController::postUpdateProcessing");
        let milestoneEls = [];
        let milestoneEl1 = elTo.closest('div.milestone.box-body');
        let milestoneEl2 = elFrom.closest('div.milestone.box-body');
        let item = document.querySelector(`[data-field-issue-id="${issueId}"]`);
        item.style.pointerEvents = "auto";
        (milestoneEl1 !== milestoneEl2) && (milestoneEls.pushObject(milestoneEl1));
        milestoneEls.pushObject(milestoneEl2);
        reRenderViewCb(milestoneEls);
        Logger.debug("-AppProjectBoardController::postUpdateProcessing");
    }

    /**
     * This is the list of issue statuses related to the current project.
     *
     * @property statuses
     * @returns array
     * @method get
     * @public
     */
    get statuses() {
        let statusList = [
            'new',
            'in_progress',
            'in_review',
            'done',
            'feedback',
            'pending',
            'deferred'
        ];

        let _self = this;

        statusList.forEach((status, i) => {
            let issueStatusModel = _self.issueStatuses.findBy('name', status);

            //create new object of issueStatus with its id and name.
            let issueStatus = {
                name: status,
                id: issueStatusModel.id
            }

            statusList[i] = issueStatus;
        });

        return statusList;
    }

    /**
     * This function firstly filter issues based on statuses. Then those filtered issues are sorted based on there priorities, higher
     * priority issue will be on start and low will be on last. After sorting, issues are pushed into there respective milestones.
     *
     * @property milestoneList
     * @returns array
     * @method get
     * @public
     */
    @computed('milestones.issues')
    get milestoneList() {
        let statusList = [
            'new',
            'in_progress',
            'done',
            'feedback',
            'pending',
            'deferred',
            'in_review'
        ];

        let priorities = {
            low: 1,
            medium: 2,
            high: 3,
            critical: 4,
            blocker: 5
        }

        this.milestones.forEach((milestone) => {
            //clone milestone issue
            let issues = _.clone(milestone.issues);
            
            /**
             * clear all milestone issues in order to set new sorted issues.
             * https://api.emberjs.com/ember/4.11/classes/MutableArray/methods/clear?anchor=clear
             */
            milestone.issues.clear();

            statusList.forEach(status => {
                //filter issues based on status
                let issuesByStatus = issues.filter(issue => issue.status == status);

                //first add a priority by number to an issue
                issuesByStatus.forEach(issue => {
                    issue['priorityNumber'] = priorities[issue['priority']];
                });

                //now sort issues of each status based on priorities
                issuesByStatus.sort((a, b) => b.priorityNumber - a.priorityNumber);

                //push new sorted issues
                milestone.issues.pushObjects(issuesByStatus);
            });
        });
        return this.milestones;
    }

    /**
     * This action is used to apply the search to the issues.
     *
     * @method applySearch
     * @param {Object} search The search object to apply
     * @public
     */
    @action applySearch(search) {
        this.query = search.searchquery;
        this.searchId = search.id;
    }

    /**
     * This action is used to select an issue for displaying in the sidebar
     *
     * @method selectIssue
     * @param {Object} issue The issue to select
     * @public
     */
    @action async selectIssue(issue) {
        Logger.debug("AppProjectBoardController::selectIssue");
        this.selectedIssue = issue;
        this.isLoadingIssueDetails = true;
        await this.loadIssueDetails(issue);
        this.isLoadingIssueDetails = false;
        Logger.debug("-AppProjectBoardController::selectIssue");
    }

    /**
     * This action is used to close the issue details sidebar
     *
     * @method closeIssueDetails
     * @public
     */
    @action closeIssueDetails() {
        Logger.debug("AppProjectBoardController::closeIssueDetails");
        this.selectedIssue = null;
        this.selectedIssueDetails = null;
        this.isLoadingIssueDetails = false;
        Logger.debug("-AppProjectBoardController::closeIssueDetails");
    }

    /**
     * This method loads the full issue details similar to the page route
     *
     * @method loadIssueDetails
     * @param {Object} issue The issue to load details for
     * @public
     */
    async loadIssueDetails(issue) {
        Logger.debug("AppProjectBoardController::loadIssueDetails");
        let _self = this;
        let projectId = this.trackedProject.getProjectId();
        
        let options = {
            query: `((Issue.issueNumber : ${issue.issueNumber}) AND (Issue.projectId : ${projectId}))`,
            sort: 'Issue.issueNumber,comments.dateCreated',
            order: 'ASC',
            rels: 'comments,parentissue,assignedTo,ownedBy,modifiedBy,reportedBy,issuetype,files,spent,estimated,conversationroom,childissues,watchers',
            limit: -1,
        };

        let _projectOptions = {
            query: `(Project.id : ${projectId})`,
            rels: 'issuestatuses,issuetypes',
            limit: -1,
        };

        try {
            let project = await _self.store.query('project', _projectOptions);
            let projectData = project.objectAt(0);
            
            if(projectData.issuestatuses === undefined || projectData.issuestatuses.length === 0) {
                let issueStatuses = await _self.store.query('issuestatus', {
                    query: `(Issuestatus.system : 1)`,
                    limit: -1,
                });
                projectData.issuestatuses = issueStatuses;
            }

            let issueResult = await _self.store.query('issue', options);
            let fullIssue = issueResult.objectAt(0);

            this.selectedIssueDetails = fullIssue;
            this.issueTypes = projectData.issuetypes || [];

            Logger.debug("-AppProjectBoardController::loadIssueDetails");
        } catch (error) {
            Logger.error("AppProjectBoardController::loadIssueDetails - Error:", error);
            this.errorManager.handleError(error, {
                moduleName: 'issue'
            });
        }
    }

    /**
     * This action is used to enable the pointer events of an issue after the assignee is updated.
     *
     * @method postUpdateAssignee
     * @param {Object} issue The issue to enable the pointer events for
     * @public
     */
    @action postUpdateAssignee(issue) {
        Logger.debug("AppProjectBoardController::postUpdateAssignee");
        let issueEl = document.querySelector(`[data-field-issue-id="${issue.id}"]`);
        issueEl.style.setProperty('pointer-events', 'auto');
        Logger.debug("-AppProjectBoardController::postUpdateAssignee");
    }
}
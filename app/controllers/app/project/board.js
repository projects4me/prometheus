/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import { computed, action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import { peekOrPush } from 'prometheus/utils/live/collection';
import { applyIssueAssigneeChange } from 'prometheus/utils/live/assignee';

/**
 * Board controller: kanban columns plus Hermes live handlers for status,
 * assignee, milestone, and issue-created events on the tracked project.
 *
 * @class AppProjectBoardController
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectBoardController extends PrometheusCreateController.extend(ProjectRelated) {

    /**
     * Hermes socket client used to register board live events.
     *
     * @property hermes
     * @type Ember.Service
     * @for AppProjectBoardController
     * @private
     */
    @service hermes;

    /**
     * Reload prompt shown when a live event cannot be applied in place.
     *
     * @property liveReloadPrompt
     * @type Ember.Service
     * @for AppProjectBoardController
     * @private
     */
    @service liveReloadPrompt;

    /**
     * Disposer returned by hermes.register() for this screen.
     *
     * @property hermesDisposer
     * @type Function|null
     * @for AppProjectBoardController
     * @private
     */
    hermesDisposer = null;

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
     * Whether the board panel is collapsed to give the issue detail panel more space.
     *
     * @property isBoardCollapsed
     * @type Boolean
     * @for Board
     */
    @tracked isBoardCollapsed = false;

    /**
     * The project data loaded for the selected issue
     *
     * @property projectData
     * @type Object
     * @for Board
     */
    @tracked projectData = null;

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
     * @public
     */
    @action updateIssue(issueEl, elTo, elFrom) {
        Logger.debug("AppProjectBoardController::updateIssue");
        Logger.debug('The element that was dragged is', issueEl);
        let _self = this;
        let laneMilestoneId = elTo.getAttribute('data-field-milestone-id');
        let status = elTo.parentElement.children[0].getAttribute('data-field-status');
        let newStatusId = elTo.getAttribute('data-issue-status-id');
        let issueId = issueEl.getAttribute('data-field-issue-id');
        let issueMilestoneId = issueEl.getAttribute('data-field-issue-milestone');

        (issueMilestoneId == "") && (issueMilestoneId = null);
        (laneMilestoneId == "" || laneMilestoneId === "backlog") && (laneMilestoneId = null);

        let milestone = this.findMilestoneById(issueMilestoneId);
        let issue = milestone?.issues?.findBy('id', issueId)
            || this.findIssueAcrossMilestones(issueId)
            || this.store.peekRecord('issue', issueId);
        let targetMilestone = this.findMilestoneById(laneMilestoneId);

        if (!issue || !targetMilestone) {
            Logger.error('AppProjectBoardController::updateIssue - missing issue or target milestone');
            return;
        }

        if (milestone && milestone !== targetMilestone) {
            milestone.issues.removeObject(issue);
        }
        if (!targetMilestone.issues.includes(issue)) {
            targetMilestone.issues.pushObject(issue);
        }

        issue.set('status', status);
        issue.set('milestoneId', laneMilestoneId);
        issue.set('statusId', newStatusId);
        issue.save().then(() => {
            _self.postUpdateProcessing(issueId, elTo, elFrom);
        });
        Logger.debug("-AppProjectBoardController::updateIssue");
    }

    /**
     * Resolves a milestone from the board list. Empty / null / "backlog" maps to the backlog tab.
     *
     * @method findMilestoneById
     * @param {String|null} milestoneId
     * @returns {Object|null}
     * @private
     */
    findMilestoneById(milestoneId) {
        if (milestoneId == null || milestoneId === '' || milestoneId === 'backlog') {
            return this.milestones.findBy('milestoneType', 'backlog')
                || this.milestones.findBy('id', null);
        }
        return this.milestones.findBy('id', milestoneId);
    }

    /**
     * Finds an issue across all milestone issue lists on the board.
     *
     * @method findIssueAcrossMilestones
     * @param {String} issueId
     * @returns {Object|null}
     * @private
     */
    findIssueAcrossMilestones(issueId) {
        for (let milestone of this.milestones || []) {
            let issue = milestone.issues?.findBy('id', issueId);
            if (issue) {
                return issue;
            }
        }
        return null;
    }

    /**
     * Registers the board's Hermes intents for the tracked project.
     *
     * @method registerHermesIntents
     * @param {String} projectId Tracked project id
     * @returns {void}
     * @public
     */
    registerHermesIntents(projectId) {
        this.unregisterHermesIntents();
        if (!projectId) {
            return;
        }
        this.hermesDisposer = this.hermes.register(this, projectId, {
            'issue.status.changed': this.handleIssueStatusChanged.bind(this),
            'issue.assignee.changed': this.handleIssueAssigneeChanged.bind(this),
            'milestone.created': this.handleMilestoneCreated.bind(this),
            'milestone.completed': this.handleMilestoneCompleted.bind(this),
            'issue.created': this.handleIssueCreated.bind(this)
        });
    }

    /**
     * Disposes the board's Hermes registration and clears the reload prompt.
     *
     * @method unregisterHermesIntents
     * @returns {void}
     * @public
     */
    unregisterHermesIntents() {
        this.hermesDisposer?.();
        this.hermesDisposer = null;
        this.liveReloadPrompt.clear(this);
    }

    /**
     * Applies issue.status.changed onto the matching board issue.
     *
     * @method handleIssueStatusChanged
     * @param {Object} envelope V2 domain-event envelope
     * @returns {void}
     * @public
     */
    handleIssueStatusChanged(envelope) {
        let issue = this.findIssueAcrossMilestones(envelope.resource.id)
            || this.store.peekRecord('issue', envelope.resource.id);
        if (!issue) {
            return;
        }
        let changes = envelope.changes || {};
        ['status', 'statusId', 'milestoneId'].forEach((key) => {
            if (key in changes && issue.get(key) !== changes[key]) {
                issue.set(key, changes[key]);
            }
        });
        this.applyRemoteIssueLaneMove(envelope);
    }

    /**
     * Applies issue.assignee.changed onto the matching board issue.
     *
     * @method handleIssueAssigneeChanged
     * @param {Object} envelope V2 domain-event envelope
     * @returns {void}
     * @public
     */
    handleIssueAssigneeChanged(envelope) {
        let issue = this.findIssueAcrossMilestones(envelope.resource.id)
            || this.store.peekRecord('issue', envelope.resource.id);
        applyIssueAssigneeChange(this.store, issue, envelope);
    }

    /**
     * Inserts a newly created milestone ahead of the backlog lane.
     *
     * @method handleMilestoneCreated
     * @param {Object} envelope V2 domain-event envelope
     * @returns {void}
     * @public
     */
    handleMilestoneCreated(envelope) {
        let milestone = peekOrPush(
            this.store,
            'milestone',
            envelope.resource.id,
            envelope.changes
        );
        if (!milestone || this.milestones?.findBy('id', milestone.id)) {
            return;
        }
        let backlog = this.milestones.findBy('milestoneType', 'backlog');
        let index = backlog ? this.milestones.indexOf(backlog) : this.milestones.length;
        this.milestones.insertAt(index, milestone);
    }

    /**
     * Removes a completed milestone from the board.
     *
     * @method handleMilestoneCompleted
     * @param {Object} envelope V2 domain-event envelope
     * @returns {void}
     * @public
     */
    handleMilestoneCompleted(envelope) {
        let milestone = this.milestones?.findBy('id', envelope.resource.id);
        if (milestone) {
            this.milestones.removeObject(milestone);
        }
    }

    /**
     * Prompts a reload when a new issue cannot be placed without a refresh.
     *
     * @method handleIssueCreated
     * @returns {void}
     * @public
     */
    handleIssueCreated() {
        this.liveReloadPrompt.show(this, () => this.router.refresh());
    }

    /**
     * Removes an issue from every milestone issue list on the board.
     *
     * @method removeIssueFromBoard
     * @param {String} issueId
     * @private
     */
    removeIssueFromBoard(issueId) {
        for (let milestone of this.milestones || []) {
            let issue = milestone.issues?.findBy('id', issueId);
            if (issue) {
                milestone.issues.removeObject(issue);
            }
        }
    }

    /**
     * Moves a remotely updated issue between milestone lanes and shows a toast.
     *
     * @method applyRemoteIssueLaneMove
     * @param {Object} payload
     * @public
     */
    applyRemoteIssueLaneMove(payload) {
        let issueId = payload.resource?.id || payload.id;
        let issue = this.findIssueAcrossMilestones(issueId)
            || this.store.peekRecord('issue', issueId);

        if (!issue) {
            Logger.warn('AppProjectBoardController::applyRemoteIssueLaneMove - issue not on board', payload);
            return;
        }

        let milestoneId = issue.get('milestoneId');
        (milestoneId == "" || milestoneId === "backlog") && (milestoneId = null);

        let targetMilestone = this.findMilestoneById(milestoneId);
        if (!targetMilestone) {
            Logger.warn('AppProjectBoardController::applyRemoteIssueLaneMove - missing target milestone', payload);
            return;
        }

        for (let milestone of this.milestones || []) {
            if (milestone !== targetMilestone && milestone.issues?.includes(issue)) {
                milestone.issues.removeObject(issue);
            }
        }
        if (!targetMilestone.issues.includes(issue)) {
            targetMilestone.issues.pushObject(issue);
        }

        if (payload.actorId && payload.actorId === this.currentUser.user?.id) {
            return;
        }

        let issueNumber = payload.meta?.issueNumber || issue.get('issueNumber');
        let actorName = payload.meta?.actorName || 'Someone';
        let status = this.intl.t(`views.app.issue.lists.status.${issue.get('status')}`);

        new Messenger().post({
            message: `<strong>#${issueNumber}</strong> moved to <strong>${status}</strong> by ${actorName}`,
            type: 'info',
            showCloseButton: true,
            hideAfter: 3
        });
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
     * @public
     */
    postUpdateProcessing(issueId, elTo, elFrom) {
        Logger.debug("AppProjectBoardController::postUpdateProcessing");
        let milestoneEls = [];
        let milestoneEl1 = elTo.closest('div.milestone.box-body');
        let milestoneEl2 = elFrom.closest('div.milestone.box-body');
        (milestoneEl1 !== milestoneEl2) && (milestoneEls.pushObject(milestoneEl1));
        milestoneEls.pushObject(milestoneEl2);
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
        window.scrollTo({top: 0, behavior: 'smooth'});
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
        this.isBoardCollapsed = false;
        Logger.debug("-AppProjectBoardController::closeIssueDetails");
    }

    /**
     * Returns the Bootstrap column class for the board panel.
     *
     * @property boardColumnClass
     * @type String
     * @for Board
     */
    get boardColumnClass() {
        return `board-column col-md-${this.selectedIssue ? '8' : '12'}`;
    }

    /**
     * Returns the Bootstrap column class for the issue detail panel.
     *
     * @property issueColumnClass
     * @type String
     * @for Board
     */
    get issueColumnClass() {
        return this.isBoardCollapsed ? 'col-md-12' : 'col-md-4';
    }

    /**
     * Toggles the board between its expanded and collapsed states.
     *
     * @method toggleBoardCollapse
     * @public
     */
    @action toggleBoardCollapse() {
        Logger.debug("AppProjectBoardController::toggleBoardCollapse");
        this.isBoardCollapsed = !this.isBoardCollapsed;
        Logger.debug("-AppProjectBoardController::toggleBoardCollapse");
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
        let projectId = this.trackedProject.getProjectId();
        let issueNumber = issue.get('issueNumber');
        
        let options = {
            query: `((Issue.issueNumber : ${issueNumber}) AND (Issue.projectId : ${projectId}))`,
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
            if(this.projectData === null) {
                let project = await this.store.query('project', _projectOptions);
                this.projectData = project.objectAt(0);
            }
            
            if(this.projectData.issuestatuses === undefined || this.projectData.issuestatuses.length === 0) {
                let issueStatuses = await this.store.query('issuestatus', {
                    query: `(Issuestatus.system : 1)`,
                    limit: -1,
                });
                this.projectData.issuestatuses = issueStatuses;
            }

            let issueResult = await this.store.query('issue', options);
            let fullIssue = issueResult.objectAt(0);

            this.selectedIssueDetails = fullIssue;
            this.issueTypes = this.projectData.issuetypes || [];

            Logger.debug("-AppProjectBoardController::loadIssueDetails");
        } catch (error) {
            Logger.error("AppProjectBoardController::loadIssueDetails - Error:", error);
            this.errorManager.handleError(error, {
                moduleName: 'issue'
            });
        }
    }

    /**
     * Callback invoked after an assignee update from the issue details panel.
     * Pointer-events cleanup is handled by the lock-item modifier.
     *
     * @method postUpdateAssignee
     * @param {Object} issue The issue that was updated
     * @public
     */
    @action postUpdateAssignee(issue) {
        Logger.debug("AppProjectBoardController::postUpdateAssignee", issue?.id);
        Logger.debug("-AppProjectBoardController::postUpdateAssignee");
    }

    /**
     * This action is used to mark a milestone as complete by setting its status to 'done' and removing it from the milestones list.
     *
     * @method markMilestoneAsComplete
     * @param {Object} milestone The milestone to mark as complete
     * @public
     */
    @action async markMilestoneAsComplete(milestone) {
        Logger.debug("AppProjectBoardController::markMilestoneAsComplete");
        let messenger = new Messenger().post({
            message: this.intl.t('views.app.board.milestone.markComplete.markingComplete', {
                milestoneName: milestone.name
            }),
            type: 'success',
            showCloseButton: true,
            hideAfter: 3
        });
        try {
            milestone.set('status', 'completed');
            await milestone.save();
            this.milestones.removeObject(milestone);
            messenger.update({
                message: this.intl.t('views.app.board.milestone.markComplete.success', {
                    milestoneName: milestone.name
                }),
                type: 'success',
                showCloseButton: true,
                hideAfter: 3
            });
            Logger.debug("-AppProjectBoardController::markMilestoneAsComplete");
        } catch (error) {
            Logger.error("AppProjectBoardController::markMilestoneAsComplete - Error:", error);
            messenger.update({
                message: this.intl.t('views.app.board.milestone.markComplete.error'),
                type: 'error',
                showCloseButton: true,
                hideAfter: 5
            });
            
            this.errorManager.handleError(error, {
                moduleName: 'milestone'
            });
        }
    }

    /**
     * This function is used to calculate the progress percentage for the given milestone.
     * 
     * @param {Prometheus.Models.Milestone} milestone 
     * @returns 
     */
    @action getMilestoneProgress(milestone) {
        let totalIssues = milestone.issues.length;
		if (totalIssues === 0) return 0;
		
		let completed = this.getCompletedIssuesCount(milestone);
		return Math.round((completed / totalIssues) * 100);
    }

    /**
     * This function returns the completed issues count for the given milestone.
     * 
     * @param {Prometheus.Models.Milestone} milestone 
     * @returns 
     */
    @action getCompletedIssuesCount(milestone) {
		let closed = 0;
		closed += milestone.issues.filterBy('status', 'done').length;
		closed += milestone.issues.filterBy('status', 'complete').length;
		closed += milestone.issues.filterBy('status', 'closed').length;
		closed += milestone.issues.filterBy('status', 'deferred').length;
		return closed;
    }
}
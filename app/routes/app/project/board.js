/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hash } from 'rsvp';

/**
 * This is the route to load the task board for a project
 *
 * @class Board
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends AppRoute
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default App.extend({

    /**
     * These are the query params that the route supports.
     *
     * @property queryParams
     * @type Array
     * @for Board
     */
    queryParams: {
        query: {
            refreshModel: true
        }
    },

    /**
     * This is the query that is used to filter the issues.
     *
     * @property query
     * @type String
     * @for Board
     */
    query: '',

    /**
     * This function is called by ember when we enter this route and returns
     * resolved promises to the controller. In this function we returns milestone
     * array which contains all milestones and backlog related to the current project.
     *
     * @method model;
     * @public
     */
    async model(params) {
        let _self = this;
        let projectId = this.trackedProject.getProjectId();
        if(_.has(params, 'query')) {
            this.set('query', params.query);
        }
        
        //Fetch milestones of current project
        let _milestoneOptions = {
            query: `((Milestone.projectId : ${projectId}) AND ((Milestone.status : in_progress) OR (Milestone.status : planned)))`,
            sort: 'Milestone.dateModified',
            order: 'DESC',
            limit: -1
        };
        let milestones = await _self.store.query('milestone', _milestoneOptions).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: "milestone"
            });
        });

        //Fetch backlog issues
        let _issueOptions = {
            query: `(((Issue.milestoneId NULL) OR (Issue.milestoneId EMPTY)) AND (Issue.projectId : ${projectId}))`,
            rels: 'assignedTo,spent,estimated,parentissue,issuetype',
            limit: -1
        }

        if(this.query) {
            _issueOptions.query = `(${_issueOptions.query}) AND (${this.query})`;
        }
        let backlogIssues = await _self.store.query('issue', _issueOptions).catch((error) => _self.errorManager.handleError(error));

        //Fetch issue statuses of project
        let _issueStatusOptions = {
            query: `(Issuestatus.projectId : ${projectId})`,
            limit: -1
        };

        let issueStatuses = await _self.store.query('issuestatus', _issueStatusOptions).catch((error) => _self.errorManager.handleError(error));

        await hash(milestones.map(async (milestone) => {
            let query = `((Issue.milestoneId : ${milestone.id} ) AND (Issue.projectId : ${projectId}))`;
            if(this.query) {
                query = `(${query}) AND (${this.query})`;
            }
            let issues = await _self.store.query('issue', {
                query: `((Issue.milestoneId : ${milestone.id} ) AND (Issue.projectId : ${projectId}))`,
                rels: 'assignedTo,spent,estimated,parentissue,issuetype',
                query: query,
                limit: -1
            }).catch((error) => {
                _self.errorManager.handleError(error);
            });
            milestone.issues.clear();
            milestone.issues.pushObjects(issues);
        }));

        //Create a milestone of type backlog
        let backlog = _self.getBacklogMilestone(backlogIssues);

        let milestonesArray = [];

        milestones.forEach((milestone) => {
            milestonesArray.pushObject(milestone);
        });
        milestonesArray.pushObject(backlog);


        let savedSearches = await this.fetchSavedSearches();
        let model = hash({
            milestones: milestonesArray,
            issueStatuses: issueStatuses || [],
            savedSearches: savedSearches || []
        });

        return model;
    },

    /**
     * This function get triggered after model() hook. In this function we're fetching
     * system level issue statuses for a project that doesn't have list of issue statuses. 
     * 
     * @method afterModel
     * @private
     */
    async afterModel(model) {
        let _self = this;

        //if there are no issue statuses for a project then fetch system level statuses
        if (model.issueStatuses.length === 0) {
            let _issueStatusOptions = {
                query: `(Issuestatus.system : 1)`,
                limit: -1
            };

            let issueStatuses = await _self.store.query('issuestatus', _issueStatusOptions).catch(() => true);
            model.issueStatuses = issueStatuses;
        }
        return model;
    },

    /**
     * This function is used to fetch the saved searches.
     *
     * @method fetchSavedSearches
     * @returns {Array} The saved searches
     */
    async fetchSavedSearches() {
        let savedSearches = await this.store.query('savedsearch', {
            query: `(Savedsearch.relatedTo : issue) AND (Savedsearch.projectId : ${this.trackedProject.getProjectId()})`,
            limit: -1
        });

        let publicSearches = await this.store.query('savedsearch', {
            query: `(Savedsearch.relatedTo : issue) AND (Savedsearch.projectId : ${this.trackedProject.getProjectId()}) AND (Savedsearch.public : 1)`,
            limit: -1
        });
        
        let allSearches = savedSearches.toArray().concat(publicSearches.toArray());
        return allSearches;
    },

    /**
     * This function is used to get the backlog milestone.
     * 
     * @method getBacklogMilestone
     * @param {Array} issues The issues to be added to the backlog milestone
     * @returns {MilestoneModel} The backlog milestone
     */
    getBacklogMilestone(issues) {
        let backlog = this.store.peekAll('milestone').findBy('milestoneType', 'backlog');
        if(!backlog) {
            backlog = this.store.createRecord('milestone', {
            id: null,
            milestoneType: "backlog",
            status: "planned",
            issues: issues || []
            });
        } else {
            backlog.issues.clear();
            backlog.issues.pushObjects(issues);
        }
        return backlog;
    },

    /**
     * This function is used to setup the controller for this
     * route
     *
     * @method setupController
     * @param {Prometheus.Controllers.Board} controller the controller object for this route
     * @private
     */
    setupController: function (controller, model) {
        Logger.debug('Prometheus.Routes.Board::setupController');
        controller.set('milestones', model.milestones);
        controller.set('issueStatuses', model.issueStatuses);
        controller.set('savedSearches', model.savedSearches);
        controller.set('query', this.query);
    },

    /**
     * This function is triggered on route exit.
     *
     * @method resetController
     * @param {Prometheus.Controllers.Board} controller The controller object for this route
     * @param {boolean} isExiting Whether the route is exiting
     * @private
     */
    resetController: function (controller, isExiting) {
        if (isExiting) {
            controller.query = null;
            controller.searchId = null;
            controller.projectData = null;
            controller.isLoadingIssueDetails = false;
            controller.selectedIssue = null;
            controller.selectedIssueDetails = null;
            this.set('query', null);
        }
    }
});
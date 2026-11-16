/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hashSettled } from 'rsvp';
import { service } from '@ember/service';
import { replaceRecords } from 'prometheus/utils/array/record-list';

/**
 * This is the route to load the task board for a project
 *
 * @class Board
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends AppRoute
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class BoardRoute extends App {

    /**
     * These are the query params that the route supports.
     *
     * @property queryParams
     * @type Array
     * @for Board
     */
    queryParams = {
        query: {
            refreshModel: true
        },
        searchId: {
            refreshModel: false
        }
    };

    /**
     * The ezSearch schema builder.
     *
     * @property querySchema
     * @type Ember.Service
     */
    @service('query-schema') querySchema;

    /**
     * The saved searches service.
     *
     * @property savedSearch
     * @type Ember.Service
     */
    @service('saved-search') savedSearch;

    /**
     * Batches the board's queries into bulk requests.
     *
     * @property bulk
     * @type Ember.Service
     */
    @service bulk;

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
        let searchQuery = params?.query || '';
        let withSearch = (query) => searchQuery ? `(${query}) AND (${searchQuery})` : query;
        let issueRels = 'assignedTo,spent,estimated,parentissue,issuetype,comments,files';

        // Round 1: milestones, backlog issues and issue statuses in one bulk request
        let first = await _self.bulk.query([
            {
                id: 'milestones',
                modelName: 'milestone',
                query: {
                    query: `((Milestone.projectId : ${projectId}) AND ((Milestone.status : in_progress) OR (Milestone.status : planned)))`,
                    sort: 'Milestone.dateModified',
                    order: 'DESC',
                    limit: -1
                }
            },
            {
                id: 'backlog',
                modelName: 'issue',
                query: {
                    query: withSearch(`(((Issue.milestoneId NULL) OR (Issue.milestoneId EMPTY)) AND (Issue.projectId : ${projectId}))`),
                    rels: issueRels,
                    limit: -1
                }
            },
            {
                id: 'statuses',
                modelName: 'issuestatus',
                query: {
                    query: `(Issuestatus.projectId : ${projectId})`,
                    limit: -1
                }
            }
        ]);

        let recordsOf = (result, options = {}) => {
            if (result.error) {
                _self.errorManager.handleError(result.error, options);
                return undefined;
            }
            return result.records;
        };

        let milestones = recordsOf(first.milestones, { moduleName: 'milestone' }) || [];
        let backlogIssues = recordsOf(first.backlog);
        let issueStatuses = recordsOf(first.statuses);

        // Round 2: the issues of every milestone lane in one bulk request
        if (milestones.length > 0) {
            let lanes = await _self.bulk.query(milestones.map((milestone) => ({
                id: `milestone-${milestone.id}`,
                modelName: 'issue',
                query: {
                    rels: issueRels,
                    query: withSearch(`((Issue.milestoneId : ${milestone.id} ) AND (Issue.projectId : ${projectId}))`),
                    limit: -1
                }
            })));

            milestones.forEach((milestone) => {
                // a failed lane shows as empty
                replaceRecords(milestone.issues, recordsOf(lanes[`milestone-${milestone.id}`]));
            });
        }

        //Create a milestone of type backlog
        let backlog = _self.getBacklogMilestone(backlogIssues);

        return {
            milestones: [...milestones, backlog],
            issueStatuses: issueStatuses || []
        };
    }

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

            let issueStatuses = await _self.store.query('issuestatus', _issueStatusOptions).catch(() => []);
            model.issueStatuses = issueStatuses;
        }

        //Board columns follow the order configured in Settings
        model.issueStatuses = [...model.issueStatuses.slice()].sort((a, b) => a.sortOrder - b.sortOrder);
        await this.loadSearchData();
        return model;
    }

    /**
     * Loads the ezSearch schema and the saved searches of the issues once per visit; a failure only drops the search.
     *
     * @method loadSearchData
     * @returns {Promise}
     * @private
     */
    async loadSearchData() {
        if (this.searchData) {
            return;
        }
        let projectId = this.trackedProject.getProjectId();
        let results = await hashSettled({
            schema: this.querySchema.load('TaskBoard', { projectId }),
            savedsearches: this.savedSearch.load('issue', projectId)
        });
        if (results.schema.state === 'rejected') {
            this.errorManager.handleError(results.schema.reason, { moduleName: 'issue' });
        }
        this.searchData = {
            schema: results.schema.state === 'fulfilled' ? results.schema.value : null,
            savedsearches: results.savedsearches.state === 'fulfilled' ? results.savedsearches.value : []
        };
    }

    /**
     * This function is used to get the backlog milestone.
     * 
     * @method getBacklogMilestone
     * @param {Array} issues The issues to be added to the backlog milestone
     * @returns {MilestoneModel} The backlog milestone
     */
    getBacklogMilestone(issues) {
        let backlog = this.store.peekAll('milestone').find((item) => item.milestoneType === 'backlog');
        if(!backlog) {
            backlog = this.store.createRecord('milestone', {
            id: null,
            milestoneType: "backlog",
            status: "planned",
            issues: issues || []
            });
        } else {
            replaceRecords(backlog.issues, issues);
        }
        return backlog;
    }

    /**
     * Sets board model data on the controller, registers Hermes intents
     * for this project's live board events and registers the board's quick
     * view as the issue preview target.
     *
     * @method setupController
     * @param {Prometheus.Controllers.Board} controller the controller object for this route
     * @private
     */
    setupController(controller, model) {
        Logger.debug('Prometheus.Routes.Board::setupController');
        controller.set('milestones', model.milestones);
        controller.set('issueStatuses', model.issueStatuses);
        controller.set('querySchema', this.searchData?.schema ?? null);
        controller.set('savedsearches', this.searchData?.savedsearches ?? []);
        if (!controller.newSavedsearch) {
            controller.set('newSavedsearch', this.store.createRecord('savedsearch'));
        }
        controller.set('selectedIssue', null);
        controller.registerHermesIntents(this.trackedProject.getProjectId());
        controller.registerIssuePreview();
    }

    /**
     * On exit, dispose Hermes intents and the issue preview registration, and
     * clear board UI state.
     *
     * @method resetController
     * @param {Prometheus.Controllers.Board} controller The controller object for this route
     * @param {boolean} isExiting Whether the route is exiting
     * @private
     */
    resetController(controller, isExiting) {
        if (isExiting) {
            controller.unregisterHermesIntents();
            controller.unregisterIssuePreview();
            controller.query = null;
            controller.searchId = null;
            controller.projectData = null;
            controller.isLoadingIssueDetails = false;
            controller.selectedIssue = null;
            controller.selectedIssueDetails = null;
            this.searchData = null;
        }
    }
}

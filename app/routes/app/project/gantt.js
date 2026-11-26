/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import UrlState from 'prometheus/utils/state/url-state';
import App from 'prometheus/routes/app';
import { hash, hashSettled } from 'rsvp';
import { service } from '@ember/service';
import * as dates from 'prometheus/utils/date';
import { toArray } from 'prometheus/utils/array/to-array';

import { replaceRecords } from 'prometheus/utils/array/record-list';

/**
 * Issue ids per time log query of the Gantt (keeps each query string short).
 *
 * @property TIMELOG_CHUNK
 * @type Number
 */
const TIMELOG_CHUNK = 50;

/**
 * Most time log rows one query of TIMELOG_CHUNK issues returns.
 *
 * @property TIMELOG_LIMIT
 * @type Number
 */
const TIMELOG_LIMIT = 1000;
/**
 * This is the route to load the Gantt chart for a project
 *
 * @class GanttRoute
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends App
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class GanttRoute extends App {
	/**
	 * These are the query params that the route supports.
	 *
	 * @property queryParams
	 * @type Object
	 * @for GanttRoute
	 */
	queryParams = {
		query: {
			refreshModel: true
		},
		searchId: {
			refreshModel: false
		},
		issue: {
			refreshModel: false
		}
	};

	/**
	 * The ezSearch schema builder.
	 *
	 * @property querySchema
	 * @type Ember.Service
	 * @for GanttRoute
	 */
	@service('query-schema') querySchema;

	/**
	 * The saved searches service.
	 *
	 * @property savedSearch
	 * @type Ember.Service
	 * @for GanttRoute
	 */
	@service('saved-search') savedSearch;

	/**
	 * Loads the project's typed issue links.
	 *
	 * @property issueRelations
	 * @type Ember.Service
	 * @for GanttRoute
	 */
	@service issueRelations;

	/**
	 * Batches the milestone lane queries into one bulk request.
	 *
	 * @property bulk
	 * @type Ember.Service
	 * @for GanttRoute
	 */
	@service bulk;

	/**
	 * This is the query that is used to filter the issues.
	 *
	 * @property query
	 * @type String
	 * @for GanttRoute
	 */
	query = '';

	/**
	 * The ezSearch schema and saved searches of the issues, loaded once per visit and project.
	 *
	 * @property searchData
	 * @type Object
	 * @for GanttRoute
	 */
	searchData = null;

	/**
	 * This function is called by ember when we enter this route and returns
	 * resolved promises to the controller. In this function we return milestone
	 * array which contains all milestones and their issues for the current project.
	 *
	 * @method model
	 * @param {Object} params The route parameters
	 * @public
	 */
	async model(params) {
		let _self = this;
		let projectId = this.trackedProject.getProjectId();
		// one request, alongside the milestones
		let linksRequest = this.loadLinks(projectId);

		let searchQuery = params?.query || '';
		this.query = searchQuery;

		// Fetch milestones of current project (in_progress and planned)
		let _milestoneOptions = {
			query: `((Milestone.projectId : ${projectId}) AND ((Milestone.status : in_progress) OR (Milestone.status : planned)))`,
			sort: 'Milestone.startDate',
			order: 'ASC',
			limit: -1
		};

		let milestones = await _self.store
			.query('milestone', _milestoneOptions)
			.catch((error) => {
				// 401/403 still run their handlers; any other failure shows the empty Gantt with an error message
				_self.errorManager.handleLoadError(error, {
					moduleName: 'milestone'
				});
				_self.notify('error', 'views.nav.menu.gantt.loadError');
				return [];
			});

		// Fetch the issues of every milestone lane in one bulk request
		if (milestones?.length > 0) {
			let lanes = await _self.bulk.query(
				milestones.map((milestone) => {
					let query = `((Issue.milestoneId : ${milestone.id}) AND (Issue.projectId : ${projectId}))`;
					if (searchQuery) {
						query = `(${query}) AND (${searchQuery})`;
					}
					return {
						id: `milestone-${milestone.id}`,
						modelName: 'issue',
						query: {
							query: query,
							// belongsTo rels only: the time logs come from their own query (loadTimelogs)
							rels: 'assignedTo,modifiedBy,parentissue,issuetype,issuestatus,reportedBy,ownedBy',
							limit: -1
						}
					};
				})
			);

			let failedIds = [];
			milestones.forEach((milestone) => {
				let lane = lanes[`milestone-${milestone.id}`];
				if (!lane || lane.error) {
					// a failed lane stays empty
					failedIds.push(milestone.id);
					_self.errorManager.handleLoadError(lane?.error, { moduleName: 'issue' });
					replaceRecords(milestone.issues, []);
				} else {
					replaceRecords(milestone.issues, lane.records);
				}
			});
			if (failedIds.length > 0) {
				Logger.error('Gantt: the issues of these milestones could not be loaded', failedIds);
				// one warning per load, not per lane
				_self.notify('warning', 'views.nav.menu.gantt.lanesFailed');
			}
		}

		// Convert milestones to array
		let milestonesArray = toArray(milestones);

		// Calculate project timeline bounds
		let timelineBounds = this.calculateTimelineBounds(milestonesArray);

		let timelogs = await this.loadTimelogs(milestonesArray);

		let model = hash({
			milestones: milestonesArray,
			timelogs: timelogs,
			links: await linksRequest,
			timelineStart: timelineBounds.start,
			timelineEnd: timelineBounds.end
		});

		return model;
	}

	/**
	 * Posts a translated Messenger message.
	 *
	 * @method notify
	 * @param {String} type The Messenger type (error, warning)
	 * @param {String} key The translation key
	 * @private
	 */
	notify(type, key) {
		new Messenger().post({ message: this.intl.t(key), type, showCloseButton: true });
	}

	/**
	 * Loads the project's issue links with one query. A failure is logged and the Gantt has no links.
	 *
	 * @method loadLinks
	 * @param {String} projectId
	 * @returns {Promise<IssueLinkLookup>}
	 * @private
	 */
	async loadLinks(projectId) {
		try {
			return await this.issueRelations.linksOfProject(projectId);
		} catch (error) {
			console.error('Could not load the issue links of the Gantt', error);
			return this.issueRelations.emptyLinks();
		}
	}

	/**
	 * Loads the spent and estimated time logs of the shown issues for the bars' % done, in one bulk request of
	 * TIMELOG_CHUNK issue ids per item, each filtered on the server and capped at TIMELOG_LIMIT rows. A failed
	 * item only leaves its issues without a fill.
	 *
	 * @method loadTimelogs
	 * @param {Array} milestones The milestones with their issues
	 * @returns {Promise<Array>} The time log records
	 */
	async loadTimelogs(milestones) {
		let issueIds = milestones.flatMap((milestone) => toArray(milestone.issues).map((issue) => issue.id));
		if (issueIds.length === 0) {
			return [];
		}
		let chunks = [];
		for (let i = 0; i < issueIds.length; i += TIMELOG_CHUNK) {
			chunks.push(issueIds.slice(i, i + TIMELOG_CHUNK));
		}
		let results = await this.bulk.query(
			chunks.map((ids, index) => ({
				id: `timelogs-${index}`,
				modelName: 'timelog',
				query: {
					query: `((Timelog.issueId CONTAINS ${ids.map((id) => `'${id}'`).join(',')}) AND ((Timelog.context : spent) OR (Timelog.context : est)))`,
					limit: TIMELOG_LIMIT
				}
			}))
		);
		return chunks.flatMap((ids, index) => {
			let result = results[`timelogs-${index}`];
			if (!result || result.error) {
				this.errorManager.handleLoadError(result?.error, { moduleName: 'timelog' });
				Logger.error('Gantt: the time logs of a chunk of issues could not be loaded', ids);
				return [];
			}
			return toArray(result.records);
		});
	}

	/**
	 * Loads the ezSearch schema and the saved searches of the issues once per visit; a failure only drops the search.
	 *
	 * @method afterModel
	 * @returns {Promise}
	 */
	async afterModel() {
		let projectId = this.trackedProject.getProjectId();
		if (this.searchData?.projectId === projectId) {
			return;
		}
		let results = await hashSettled({
			schema: this.querySchema.load('Issue', { projectId }),
			savedsearches: this.savedSearch.load('issue', projectId)
		});
		if (results.schema.state === 'rejected') {
			this.errorManager.handleError(results.schema.reason, { moduleName: 'issue' });
		}
		if (results.savedsearches.state === 'rejected') {
			this.errorManager.handleError(results.savedsearches.reason, { moduleName: 'savedsearch' });
		}
		let failed = results.schema.state === 'rejected' || results.savedsearches.state === 'rejected';
		this.searchData = {
			// a failed load is not cached, so the next refresh retries it
			projectId: failed ? null : projectId,
			schema: results.schema.state === 'fulfilled' ? results.schema.value : null,
			savedsearches: results.savedsearches.state === 'fulfilled' ? results.savedsearches.value : []
		};
	}

	/**
	 * Calculate the timeline bounds (earliest start date and latest end date)
	 * from all milestones and issues.
	 *
	 * @method calculateTimelineBounds
	 * @param {Array} milestones Array of milestone objects
	 * @returns {Object} Object with start and end dates
	 */
	calculateTimelineBounds(milestones) {
		let earliestDate = dates.startOf(dates.now(), 'day');
		let latestDate = dates.endOf(dates.add(dates.now(), 3, 'months'), 'day');

		milestones.forEach((milestone) => {
			// Check milestone dates
			if (milestone.startDate) {
				if (dates.isValid(milestone.startDate) && dates.isBefore(milestone.startDate, earliestDate)) {
					earliestDate = dates.parse(milestone.startDate);
				}
			}
			if (milestone.endDate) {
				if (dates.isValid(milestone.endDate) && dates.isAfter(milestone.endDate, latestDate)) {
					latestDate = dates.parse(milestone.endDate);
				}
			}

			// Check issues dates
			milestone.issues.forEach((issue) => {
				if (issue.startDate) {
					if (dates.isValid(issue.startDate) && dates.isBefore(issue.startDate, earliestDate)) {
						earliestDate = dates.parse(issue.startDate);
					}
				}
				if (issue.endDate) {
					if (dates.isValid(issue.endDate) && dates.isAfter(issue.endDate, latestDate)) {
						latestDate = dates.parse(issue.endDate);
					}
				}
			});
		});

		// Add some padding
		earliestDate = dates.startOf(dates.subtract(earliestDate, 1, 'week'), 'week');
		latestDate = dates.endOf(dates.add(latestDate, 2, 'weeks'), 'week');

		return {
			start: dates.format(earliestDate, 'YYYY-MM-DD'),
			end: dates.format(latestDate, 'YYYY-MM-DD')
		};
	}

	/**
	 * Sets gantt model data on the controller and registers Hermes intents
	 * for this project's live gantt events.
	 *
	 * @method setupController
	 * @param {Prometheus.Controllers.Gantt} controller The controller object for this route
	 * @param {Object} model The resolved model
	 * @private
	 */
	setupController(controller, model) {
		Logger.debug('Prometheus.Routes.Gantt::setupController');
		controller.set('milestones', model.milestones);
		controller.set('timelogs', model.timelogs ?? []);
		controller.set('links', model.links ?? this.issueRelations.emptyLinks());
		controller.set('timelineStart', model.timelineStart);
		controller.set('timelineEnd', model.timelineEnd);
		controller.set('querySchema', this.searchData?.schema ?? null);
		controller.set('savedsearches', this.searchData?.savedsearches ?? []);
		controller.set('selectedIssue', null);
		controller.set('isIssuePanelOpen', false);
		controller.registerHermesIntents(this.trackedProject.getProjectId());
		controller.registerIssuePreview();
		controller.showIssueFromUrl(controller.urlState.values.issue);
	}

	/**
	 * On exit, dispose Hermes intents and clear gantt UI state.
	 *
	 * @method resetController
	 * @param {Prometheus.Controllers.Gantt} controller The controller object for this route
	 * @param {boolean} isExiting Whether the route is exiting
	 * @param {Transition} transition The transition that leaves the route
	 * @private
	 */
	resetController(controller, isExiting, transition) {
		if (isExiting) {
			controller.unregisterHermesIntents();
			controller.unregisterIssuePreview();
			controller.query = null;
			controller.searchId = null;
			this.searchData = null;
			controller.selectedIssue = null;
			// a search refreshes the model through the gantt_loading substate, which also exits the route: keep the collapses then
			if (!transition?.targetName?.startsWith(this.routeName)) {
				controller.collapsedMilestones = new Set();
			}
			controller.scrollRequest = null;
			UrlState.resetController(controller);
			this.query = null;
		}
	}
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { hash, hashSettled } from 'rsvp';
import { inject as service } from '@ember/service';
import * as dates from 'prometheus/utils/date';
import { toArray } from 'prometheus/utils/array/to-array';

import { replaceRecords } from 'prometheus/utils/array/record-list';
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
				_self.errorManager.handleError(error, {
					moduleName: 'milestone'
				});
			});

		// Fetch issues for each milestone
		await hash(
			milestones.map(async (milestone) => {
				let query = `((Issue.milestoneId : ${milestone.id}) AND (Issue.projectId : ${projectId}))`;
				if (searchQuery) {
					query = `(${query}) AND (${searchQuery})`;
				}
				let issues = await _self.store
					.query('issue', {
						query: query,
						rels: 'assignedTo,modifiedBy,spent,estimated,parentissue,issuetype,issuestatus,reportedBy,ownedBy',
						limit: -1
					})
					.catch((error) => {
						_self.errorManager.handleError(error);
					});
				replaceRecords(milestone.issues, issues);
			})
		);

		// Convert milestones to array
		let milestonesArray = toArray(milestones);

		// Calculate project timeline bounds
		let timelineBounds = this.calculateTimelineBounds(milestonesArray);

		let model = hash({
			milestones: milestonesArray,
			timelineStart: timelineBounds.start,
			timelineEnd: timelineBounds.end
		});

		return model;
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
		controller.set('timelineStart', model.timelineStart);
		controller.set('timelineEnd', model.timelineEnd);
		controller.set('querySchema', this.searchData?.schema ?? null);
		controller.set('savedsearches', this.searchData?.savedsearches ?? []);
		controller.set('selectedIssue', null);
		controller.set('isIssuePanelOpen', false);
		controller.autoExpandFirstMilestone();
		controller.registerHermesIntents(this.trackedProject.getProjectId());
		controller.registerIssuePreview();
	}

	/**
	 * On exit, dispose Hermes intents and clear gantt UI state.
	 *
	 * @method resetController
	 * @param {Prometheus.Controllers.Gantt} controller The controller object for this route
	 * @param {boolean} isExiting Whether the route is exiting
	 * @private
	 */
	resetController(controller, isExiting) {
		if (isExiting) {
			controller.unregisterHermesIntents();
			controller.unregisterIssuePreview();
			controller.query = null;
			controller.searchId = null;
			this.searchData = null;
			controller.selectedIssue = null;
			this.query = null;
		}
	}
}

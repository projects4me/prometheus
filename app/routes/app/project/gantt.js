/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { hash } from 'rsvp';

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
		}
	};

	/**
	 * This is the query that is used to filter the issues.
	 *
	 * @property query
	 * @type String
	 * @for GanttRoute
	 */
	query = '';

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

		if (_.has(params, 'query')) {
			this.query = params.query;
		}

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

		// Fetch backlog issues (issues without milestone)
		let _issueOptions = {
			query: `(((Issue.milestoneId NULL) OR (Issue.milestoneId EMPTY)) AND (Issue.projectId : ${projectId}))`,
			rels: 'assignedTo,spent,estimated,parentissue,issuetype',
			limit: -1
		};

		if (this.query) {
			_issueOptions.query = `(${_issueOptions.query}) AND (${this.query})`;
		}

		let backlogIssues = await _self.store
			.query('issue', _issueOptions)
			.catch((error) => _self.errorManager.handleError(error));

		// Fetch issues for each milestone
		await hash(
			milestones.map(async (milestone) => {
				let query = `((Issue.milestoneId : ${milestone.id}) AND (Issue.projectId : ${projectId}))`;
				if (this.query) {
					query = `(${query}) AND (${this.query})`;
				}
				let issues = await _self.store
					.query('issue', {
						query: query,
						rels: 'assignedTo,spent,estimated,parentissue,issuetype,issuestatus',
						limit: -1
					})
					.catch((error) => {
						_self.errorManager.handleError(error);
					});
				milestone.issues.clear();
				milestone.issues.pushObjects(issues);
			})
		);

		// Create a backlog milestone
		let backlog = _self.getBacklogMilestone(backlogIssues);

		let milestonesArray = [];
		milestones.forEach((milestone) => {
			milestonesArray.pushObject(milestone);
		});
		milestonesArray.pushObject(backlog);

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
	 * This function is used to get the backlog milestone.
	 *
	 * @method getBacklogMilestone
	 * @param {Array} issues The issues to be added to the backlog milestone
	 * @returns {MilestoneModel} The backlog milestone
	 */
	getBacklogMilestone(issues) {
		let backlog = this.store
			.peekAll('milestone')
			.findBy('milestoneType', 'backlog');
		if (!backlog) {
			backlog = this.store.createRecord('milestone', {
				id: null,
				name: 'Backlog',
				milestoneType: 'backlog',
				status: 'planned',
				issues: issues || []
			});
		} else {
			backlog.issues.clear();
			backlog.issues.pushObjects(issues);
		}
		return backlog;
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
		let earliestDate = moment().startOf('day');
		let latestDate = moment().add(3, 'months').endOf('day');

		milestones.forEach((milestone) => {
			// Check milestone dates
			if (milestone.startDate) {
				let mStart = moment(milestone.startDate);
				if (mStart.isValid() && mStart.isBefore(earliestDate)) {
					earliestDate = mStart;
				}
			}
			if (milestone.endDate) {
				let mEnd = moment(milestone.endDate);
				if (mEnd.isValid() && mEnd.isAfter(latestDate)) {
					latestDate = mEnd;
				}
			}

			// Check issues dates
			milestone.issues.forEach((issue) => {
				if (issue.startDate) {
					let iStart = moment(issue.startDate);
					if (iStart.isValid() && iStart.isBefore(earliestDate)) {
						earliestDate = iStart;
					}
				}
				if (issue.endDate) {
					let iEnd = moment(issue.endDate);
					if (iEnd.isValid() && iEnd.isAfter(latestDate)) {
						latestDate = iEnd;
					}
				}
			});
		});

		// Add some padding
		earliestDate = earliestDate.subtract(1, 'week').startOf('week');
		latestDate = latestDate.add(2, 'weeks').endOf('week');

		return {
			start: earliestDate.format('YYYY-MM-DD'),
			end: latestDate.format('YYYY-MM-DD')
		};
	}

	/**
	 * This function is used to setup the controller for this route.
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
		controller.set('query', this.query);
	}

	/**
	 * This function is triggered on route exit.
	 *
	 * @method resetController
	 * @param {Prometheus.Controllers.Gantt} controller The controller object for this route
	 * @param {boolean} isExiting Whether the route is exiting
	 * @private
	 */
	resetController(controller, isExiting) {
		if (isExiting) {
			controller.query = null;
			controller.selectedIssue = null;
			this.query = null;
		}
	}
}

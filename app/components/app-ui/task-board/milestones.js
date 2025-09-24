/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from '../../app';
import { action } from '@ember/object';
import DateUtils from 'prometheus/utils/date';

/**
 * This component is used to render milestones of selected project.
 *
 * @class TaskBoardMilestones
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class TaskBoardMilestonesComponent extends AppComponent {
	/**
	 * This property returns the progress of the milestone
	 *
	 * @property milestoneProgress
	 * @type Number
	 * @for TaskBoardMilestones
	 * @public
	 */
	get milestoneProgress() {
		return this.calculateMilestoneProgress();
	}

	/**
	 * This property returns list of milestones
	 *
	 * @property milestone
	 * @type Object
	 * @for TaskBoardMilestones
	 * @public
	 */
	get milestone() {
		return this.args.milestone;
	}

	/**
	 * This property returns the count of completed issues
	 *
	 * @property completedIssuesCount
	 * @type Number
	 * @for TaskBoardMilestones
	 * @public
	 */
	get completedIssuesCount() {
		return this.getCompletedIssuesCount();
	}

	/**
	 * This property returns the appropriate icon class based on milestone status
	 *
	 * @property milestoneIcon
	 * @type String
	 * @for TaskBoardMilestones
	 * @public
	 */
	get milestoneIcon() {
		let milestone = this.milestone;
		let status = milestone.status;

		// Check if milestone is overdue
		if (status === 'in_progress' || status === 'planned') {
			if (moment().isSameOrAfter(milestone.endDate)) {
				status = 'overdue';
			}
		}

		return status === 'overdue'
			? 'fa fa-exclamation-triangle'
			: 'fa fa-bullseye';
	}

	/**
	 * This property returns the appropriate background color class based on milestone status
	 *
	 * @property milestoneBgClass
	 * @type String
	 * @for TaskBoardMilestones
	 * @public
	 */
	get milestoneBgClass() {
		let milestone = this.milestone;
		let status = milestone.status;

		// Check if milestone is overdue
		if (status === 'in_progress' || status === 'planned') {
			if (moment().isSameOrAfter(milestone.endDate)) {
				status = 'overdue';
			}
		}

		return status === 'overdue' ? 'bg-red' : 'bg-yellow';
	}

	/**
	 * This function calculates and sets the progress of the milestone based on issue statuses.
	 *
	 * @method constructor
	 * @for TaskBoardMilestones
	 * @public
	 */
	constructor() {
		super(...arguments);
	}

	/**
	 * This function calculates the progress of the milestone based on completed issues.
	 * Issues with status 'done', 'complete', 'closed', or 'deferred' are considered completed.
	 *
	 * @method calculateMilestoneProgress
	 * @public
	 */
	calculateMilestoneProgress() {
		let milestone = this.milestone;
		let progress = 0;
		let totalIssues = milestone.issues.length;

		// Calculate the progress
		if (totalIssues > 0) {
			let closed = this.getCompletedIssuesCount();
			progress = _.round((closed / totalIssues) * 100);
		}

		return progress;
	}

	/**
	 * This function returns the count of completed issues.
	 * Issues with status 'done', 'complete', 'closed', or 'deferred' are considered completed.
	 *
	 * @method getCompletedIssuesCount
	 * @public
	 */
	getCompletedIssuesCount() {
		let milestone = this.milestone;
		let closed = 0;
		closed += milestone.issues.filterBy('status', 'done').length;
		closed += milestone.issues.filterBy('status', 'complete').length;
		closed += milestone.issues.filterBy('status', 'closed').length;
		closed += milestone.issues.filterBy('status', 'deferred').length;
		return closed;
	}

	/**
	 * This function returns the count of issues for a specific status.
	 *
	 * @method getIssuesCountForStatus
	 * @param {String} statusName - The name of the status
	 * @public
	 */
	@action getIssuesCountForStatus(statusName) {
		let milestone = this.milestone;
		return milestone.issues.filterBy('status', statusName).length;
	}

	/**
	 * This function returns the spent time of the milestone in hours and minutes.
	 *
	 * @property spent
	 * @type Object
	 * @for TaskBoardMilestones
	 * @public
	 */
	get spent() {
		return this.calculateTimeForContext('spent');
	}

	/**
	 * This function returns the estimated time of the milestone in hours and minutes.
	 *
	 * @property estimated
	 * @type Object
	 * @for TaskBoardMilestones
	 * @public
	 */
	get estimated() {
		return this.calculateTimeForContext('estimated');
	}

	/**
	 * Calculates the total time (hours and minutes) for a given context (spent or estimated).
	 * Normalizes minutes to ensure they don't exceed 60.
	 *
	 * @method calculateTimeForContext
	 * @param {String} context - The context ('spent' or 'estimated')
	 * @returns {Object} - { hours: number, minutes: number }
	 * @for TaskBoardMilestones
	 * @public
	 */
	calculateTimeForContext(context) {
		let totalHours = 0;
		let totalMinutes = 0;

		this.milestone.issues.forEach(issue => {
			issue[context]?.forEach(timelog => {
				// Convert days to hours (8 hours per day)
				let daysToHours = timelog.days * 8;
				let hours = parseInt(timelog.hours, 10) + parseInt(daysToHours, 10);
				let minutes = parseInt(timelog.minutes, 10);

				totalHours += hours;
				totalMinutes += minutes;
			});
		});

		// Normalize minutes to ensure they don't exceed 60
		const normalized = DateUtils.normalizeMinutes(totalMinutes);
		totalHours += normalized.hours;
		totalMinutes = normalized.minutes;

		return {
			hours: totalHours,
			minutes: totalMinutes
		};
	}	
}

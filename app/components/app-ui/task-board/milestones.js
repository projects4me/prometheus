/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from '../../app';
import { action } from '@ember/object';

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
}

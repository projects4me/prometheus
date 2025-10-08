/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from '../../app';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import DateUtils from 'prometheus/utils/date';
import format from 'prometheus/utils/data/format';

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
	 * This flag is used to show or hide the modal dialog box
	 * for adding issues
	 *
	 * @property addIssueDialog
	 * @type boolean
	 * @for TaskBoardMilestones
	 * @protected
	 */
	@tracked addIssueDialog = false;

	/**
	 * This is the new issue model for the modal form
	 *
	 * @property newIssue
	 * @type Object
	 * @for TaskBoardMilestones
	 * @protected
	 */
	@tracked newIssue = null;

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

		this.milestone.issues.forEach((issue) => {
			issue[context]?.forEach((timelog) => {
				// Convert days to hours (8 hours per day)
				let daysToHours = timelog.days * 8;
				let hours =
					parseInt(timelog.hours, 10) + parseInt(daysToHours, 10);
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

	/**
	 * This function is used to show the add issue modal dialog box
	 *
	 * @method showAddIssueDialog
	 * @public
	 */
	@action showAddIssueDialog(statusName) {
		let status = this.args.statuses.find(
			(status) => status.name === statusName
		);
		let milestone = this.args.milestone;
		if (this.newIssue === null) {
			this.newIssue = this.store.createRecord('issue', {
				owner: this.currentUser.user.id,
				assignee: this.currentUser.user.id,
				reportedUser: this.currentUser.user.id,
				projectId: this.trackedProject.getProjectId(),
				projectShortcode: this.trackedProject.shortCode,
				assignedTo: this.currentUser.user
			});
		}

		if (this.newIssue) {
			this.newIssue.statusId = status.id;
			this.newIssue.status = status.name;
			this.newIssue.milestoneId = milestone.id;
		}

		this.addIssueDialog = true;
	}

	/**
	 * This function is used to hide the add issue modal dialog box
	 *
	 * @method removeAddIssueModal
	 * @public
	 */
	@action removeAddIssueModal() {
		if (this.isDestroyed || this.isDestroying) return;
		this.addIssueDialog = false;
		$('.modal').modal('hide');
	}

	/**
	 * This function is used to save the new issue
	 *
	 * @method saveIssue
	 * @public
	 */
	@action async saveIssue() {
		let messenger = new Messenger().post({
			message: this.intl.t('views.app.board.issue.creating'),
			type: 'info',
			showCloseButton: false,
			hideAfter: false
		});
		try {
			await this.args.save('issueCreate', 'issue', this.newIssue, false);
			messenger.update({
				message: this.intl.t('views.app.board.issue.created', {
					subject: this.newIssue.subject
				}),
				type: 'success',
				showCloseButton: true,
				hideAfter: 3
			});
			this.milestone.issues.pushObject(this.newIssue);
			this.removeAddIssueModal();
			this.newIssue = null;
		} catch (error) {
			messenger.update({
				message: this.intl.t('views.app.board.issue.error'),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
			Logger.error(
				'TaskBoardMilestonesComponent::saveIssue - Error:',
				error
			);
		}
	}

	/**
	 * This property returns the list of issue statuses
	 *
	 * @property issueStatusList
	 * @type Array
	 * @for TaskBoardMilestones
	 * @public
	 */
	get issueStatusList() {
		return new format(this).getTranslatedModelList(
			this.args.statuses,
			'views.app.issue.lists.status'
		);
	}

	/**
	 * This property returns the list of issue types
	 *
	 * @property typeList
	 * @type Array
	 * @for TaskBoardMilestones
	 */
	get typeList() {
		return new format(this).getSelectList(this.args.issueTypes);
	}

	/**
	 * This property returns the list of priorities
	 *
	 * @property priority
	 * @type Array
	 * @for TaskBoardMilestones
	 */
	get priority() {
		return new format(this).getList('views.app.issue.lists.priority');
	}

	/**
	 * This property returns the sorted issues
	 *
	 * @property sortedIssues
	 * @type Array
	 * @for TaskBoardMilestones
	 */
	get sortedIssues() {
		let issues = (this.milestone.issues || []).slice().sort((a, b) => {
			return new Date(b.dateModified) - new Date(a.dateModified);
		});
		return issues;
	}
}

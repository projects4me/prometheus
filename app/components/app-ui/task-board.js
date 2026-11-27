/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from 'prometheus/components/app';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { insertAtIfMissing } from 'prometheus/utils/live/collection';

import { objectAt } from 'prometheus/utils/array/object-at';
import * as dates from 'prometheus/utils/date';

/**
 * The key of a milestone on the board and in the URL: its id, or `backlog` for the Backlog.
 *
 * @method milestoneKey
 * @param {Object} milestone
 * @return {String}
 * @private
 */
function milestoneKey(milestone) {
	return milestone.id ? String(milestone.id) : 'backlog';
}
/**
 * This component is used to render milestones of selected project.
 *
 * @class TaskBoard
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class TaskBoardComponent extends AppComponent {

	/**
	 * This property is used to keep track the state of the issue creation process.
	 *
	 * @property creatingIssue
	 * @type boolean
	 * @for TaskBoard
	 * @protected
	 */
	@tracked creatingIssue = false;

	/**
	 * This property is used to keep track the state of the new milestone addition to give a hint to the 
	 * initialize-sortable modifier to re-attach the sortable to the lanes.
	 *
	 * @property newMilestoneAdded
	 * @type boolean
	 * @for TaskBoard
	 * @protected
	 */
	@tracked newMilestoneAdded = false;

	/**
	 * This flag is used to show or hide the modal dialog box
	 * for adding milestones
	 *
	 * @property addMilestoneDialog
	 * @type boolean
	 * @for TaskBoard
	 * @protected
	 */
	@tracked addMilestoneDialog = false;

	/**
	 * This is the new milestone model for the modal form
	 *
	 * @property newMilestone
	 * @type Object
	 * @for TaskBoard
	 * @protected
	 */
	@tracked newMilestone = null;	

	/**
	 * This property is used to show/hide the mark as complete milestone confirmation modal.
	 *
	 * @property showMarkMilestoneAsCompleteModal
	 * @type boolean
	 * @for TaskBoard
	 * @protected
	 */
	@tracked showMarkMilestoneAsCompleteModal = false;

	/**
	 * The open milestone: the one whose key matches the activeMilestoneId argument, else the first
	 * milestone on the board.
	 *
	 * @property activeMilestone
	 * @type Object
	 * @for TaskBoard
	 * @public
	 */
	get activeMilestone() {
		let milestones = this.args.milestones || [];
		let activeId = this.args.activeMilestoneId;
		let active = (activeId !== undefined && activeId !== null)
			? milestones.find((item) => milestoneKey(item) === String(activeId))
			: null;
		return active || objectAt(milestones, 0) || null;
	}

	/**
	 * The key of the open milestone (its id, or `backlog`), handed to the sortable modifier so the
	 * open tab isn't a drop target.
	 *
	 * @property activeMilestoneKey
	 * @type String
	 * @for TaskBoard
	 * @public
	 */
	get activeMilestoneKey() {
		return this.activeMilestone ? milestoneKey(this.activeMilestone) : null;
	}


	/**
	 * This action passes the selectIssue action to the milestones component
	 *
	 * @method selectIssue
	 * @param {Object} issue The issue to select
	 * @public
	 */
	@action
	selectIssue(issue) {
		if (this.args.selectIssue) {
			this.args.selectIssue(issue);
		}
	}

	/**
	 * This action is used to save the issue.
	 *
	 * @method saveIssue
	 * @param {...any} args The arguments to pass to the save method
	 * @protected
	 */
	@action 
	async saveIssue(...args) {
		try {
			if (this.args.save) {
				await this.args.save(...args);
				this.creatingIssue = true;
			}
		} catch (error) {
			this.creatingIssue = false;
			Logger.error('TaskBoardComponent::saveIssue - Error:', error);
			throw error;
		}
		finally {
			this.creatingIssue = false;
		}
	}

	/**
	 * This action is used to show the create milestone dialog.
	 *
	 * @method showCreateMilestoneDialog
	 * @public
	 */
	@action
	showCreateMilestoneDialog() {
		if (this.newMilestone === null) {
			this.newMilestone = this.store.createRecord('milestone', {
				projectId: this.trackedProject.getProjectId(),
				startDate: dates.format(dates.now(), 'YYYY-MM-DD'),
				endDate: dates.format(dates.now(), 'YYYY-MM-DD'),
				milestoneType: 'milestone',
				status: 'planned'
			});
		}
		this.addMilestoneDialog = true;
	}

	/**
	 * This action is used to hide the add milestone modal dialog box
	 *
	 * @method removeAddMilestoneModal
	 * @public
	 */
	@action
	removeAddMilestoneModal() {
		if (this.isDestroyed || this.isDestroying) return;
		this.addMilestoneDialog = false;
	}

	/**
	 * This action is used to save the new milestone
	 *
	 * @method saveMilestone
	 * @public
	 */
	@action
	async saveMilestone() {
		let messenger = new Messenger().post({
			message: this.intl.t('views.app.board.milestone.creating'),
			type: 'info',
			showCloseButton: false,
			hideAfter: false
		});
		try {
			await this.args.save('milestoneCreate', 'milestone', this.newMilestone, false);
			// Add the newly created milestone to the beginning of the milestones list
			// This will make it appear as the first tab
			insertAtIfMissing(this.args.milestones, this.newMilestone, 0);
			this.changeMilestone(this.newMilestone);
			
			messenger.update({
				message: this.intl.t('views.app.board.milestone.created', {
					name: this.newMilestone.name
				}),
				type: 'success',
				showCloseButton: true,
				hideAfter: 3
			});
			this.removeAddMilestoneModal();
			this.newMilestone = null;
			this.newMilestoneAdded = true;
		} catch (error) {
			this.newMilestoneAdded = false;
			messenger.update({
				message: this.intl.t('views.app.board.milestone.error'),
				type: 'error',
				showCloseButton: true,
				hideAfter: 3
			});
			Logger.error(
				'TaskBoardComponent::saveMilestone - Error:',
				error
			);
		}
	}

	/**
	 * This property returns the list of milestone types
	 *
	 * @property milestoneTypes
	 * @type Array
	 * @for TaskBoard
	 * @public
	 */
	get milestoneTypes() {
		return [
			{ "label": "Milestone", "value": "milestone" },
			{ "label": "Version", "value": "version" },
			{ "label": "Patch", "value": "patch" },
			{ "label": "Release", "value": "release" },
			{ "label": "Sprint", "value": "sprint" }
		];
	}

	/**
	 * This property returns the list of milestone statuses
	 *
	 * @property milestoneStatuses
	 * @type Array
	 * @for TaskBoard
	 * @public
	 */
	get milestoneStatuses() {
		return [
			{ "label": "Planned", "value": "planned" },
			{ "label": "In Progress", "value": "in_progress" },
			{ "label": "Completed", "value": "completed" },
			{ "label": "Closed", "value": "closed" },
			{ "label": "Complete", "value": "complete" },
			{ "label": "Overdue", "value": "overdue" },
			{ "label": "Deferred", "value": "deferred" },
			{ "label": "Failed", "value": "failed" }
		];
	}

	/**
	 * Reports the milestone to open through the onMilestoneChange event; the owner of the board
	 * passes it back as activeMilestoneId.
	 *
	 * @method changeMilestone
	 * @param {Object} milestone The milestone to open
	 * @public
	 */
	changeMilestone(milestone) {
		if (milestone && this.args.onMilestoneChange) {
			this.args.onMilestoneChange(milestoneKey(milestone));
		}
	}

	/**
	 * Tab click: opens the clicked milestone
	 *
	 * @method selectMilestone
	 * @param {Object} milestone The clicked milestone
	 * @param {Event} event The click event
	 * @public
	 */
	@action
	selectMilestone(milestone, event) {
		event?.preventDefault();
		this.changeMilestone(milestone);
	}

	/**
	 * The milestone shown in the phone dropdown: the open one
	 *
	 * @property selectedMilestone
	 * @type Object
	 * @public
	 */
	get selectedMilestone() {
		return this.activeMilestone;
	}

	/**
	 * Phone dropdown change: opens the chosen milestone, like a tab click
	 *
	 * @method selectMilestoneFromDropdown
	 * @param {Object} milestone The chosen milestone
	 * @public
	 */
	@action
	selectMilestoneFromDropdown(milestone) {
		this.changeMilestone(milestone);
	}

	/**
	 * This action is triggered when the close milestone checkbox is clicked.
	 * It opens the modal to close the active milestone.
	 *
	 * @method toggleMarkMilestoneAsComplete
	 * @public
	 */
	@action
	toggleMarkMilestoneAsComplete() {
		Logger.debug("TaskBoardComponent::toggleMarkMilestoneAsComplete");
		this.showMarkMilestoneAsCompleteModal = true;
		Logger.debug("-TaskBoardComponent::toggleMarkMilestoneAsComplete");
	}

	/**
	 * This action is used to cancel the close milestone operation.
	 * Unchecks the checkbox and closes the modal.
	 *
	 * @method cancelMarkMilestoneAsComplete
	 * @public
	 */
	@action
	cancelMarkMilestoneAsComplete() {
		Logger.debug("TaskBoardComponent::cancelMarkMilestoneAsComplete");
        if (this.isDestroyed || this.isDestroying) return;
		this.showMarkMilestoneAsCompleteModal = false;
		Logger.debug("-TaskBoardComponent::cancelMarkMilestoneAsComplete");
	}

	/**
	 * This action is used to confirm the mark as complete milestone operation.
	 *
	 * @method markMilestoneAsComplete
	 * @public
	 */
	@action
	async markMilestoneAsComplete() {
		Logger.debug("TaskBoardComponent::markMilestoneAsComplete");
		try {
			let milestone = this.activeMilestone;
			if (this.args.markMilestoneAsComplete && milestone) {
				await this.args.markMilestoneAsComplete(milestone);
				if (this.isDestroying || this.isDestroyed) return;
				this.cancelMarkMilestoneAsComplete();
				this.setNewActiveMilestone();
			}
		} catch (error) {
			Logger.error('TaskBoardComponent::markMilestoneAsComplete - Error:', error);
			this.cancelMarkMilestoneAsComplete();
			throw error;
		}
		Logger.debug("-TaskBoardComponent::markMilestoneAsComplete");
	}

	/**
	 * This computed property returns the completed issues count for the active milestone.
	 *
	 * @property completedIssuesCount
	 * @type Number
	 * @for TaskBoard
	 * @public
	 */
	get completedIssuesCount() {
		if (!this.activeMilestone) return 0;
		return this.args.getCompletedIssuesCount(this.activeMilestone);
	}

	/**
	 * This computed property returns the progress percentage for the active milestone.
	 *
	 * @property milestoneProgress
	 * @type Number
	 * @for TaskBoard
	 * @public
	 */
	get milestoneProgress() {
		if (!this.activeMilestone) return 0;
		return this.args.getMilestoneProgress(this.activeMilestone);
	}

	/**
	 * Opens the first milestone on the board, after the open one was marked as complete.
	 *
	 * @method setNewActiveMilestone
	 * @public
	 */
	setNewActiveMilestone() {
		Logger.debug("TaskBoardComponent::setNewActiveMilestone");
		this.changeMilestone(objectAt(this.args.milestones, 0));
		Logger.debug("-TaskBoardComponent::setNewActiveMilestone");
	}
}

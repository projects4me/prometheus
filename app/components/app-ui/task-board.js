/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from 'prometheus/components/app';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

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
	 * Constructor to initialize the component. We're setting the active search based on the selected search id (query param based).
	 *
	 * @method constructor
	 * @public
	 */
	constructor() {
		super(...arguments);
		if (this.args.selectedSearchId && this.args.savedSearches) {
			this.activeSearch = this.args.savedSearches.find(search => search.id === this.args.selectedSearchId) || null;
		}
	}

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
	 * This property is used to keep track the query, which is provided by the user, for
	 * filtering the issues.
	 *
	 * @property query
	 * @type String
	 * @for TaskBoard
	 * @protected
	 */
	@tracked query;

	/**
	 * This property is used to keep track of the query, which is provided by the user, for
	 * filtering the issues.
	 *
	 * @property filterQuery
	 * @type String
	 * @for TaskBoard
	 * @protected
	 */
	@tracked filterQuery = '';

	/**
	 * This property is used to keep track of the currently active search filter.
	 *
	 * @property activeSearch
	 * @type Object
	 * @for TaskBoard
	 * @protected
	 */
	@tracked activeSearch = null;

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
	 * This property holds the active milestone.
	 *
	 * @property activeMilestone
	 * @type Object
	 * @for TaskBoard
	 * @protected
	 */
	@tracked activeMilestone = null;

	/**
	 * This property tracks the checkbox state of the mark as complete button. If it is checked, the milestone will be marked as complete.
	 *
	 * @property markMilestoneAsCompleteChecked
	 * @type boolean
	 * @for TaskBoard
	 * @protected
	 */
	@tracked markMilestoneAsCompleteChecked = false;

	/**
	 * This action is used to toggle the search filter on/off.
	 * If the same search is clicked again, it will be deactivated.
	 * If a different search is clicked, it will replace the current one.
	 *
	 * @method toggleSearch
	 * @param {Object} search The search object to toggle
	 * @public
	 */
	@action
	toggleSearch(search) {
		if (this.activeSearch && this.activeSearch.id === search.id) {
			// Same search clicked - deactivate it
			this.activeSearch = null;
			this.filterQuery = '';
			this.args.applySearch({ searchquery: '', id: null });
		} else {
			// Different search clicked - activate it
			this.activeSearch = search;
			this.filterQuery = search.searchquery;
			this.args.applySearch(search);
		}
	}

	/**
	 * This method checks if a search is currently active.
	 *
	 * @method isSearchActive
	 * @param {Object} search The search object to check
	 * @returns {boolean} True if the search is active
	 * @public
	 */
	@action
	isSearchActive(search) {
		return this.activeSearch && this.activeSearch.id === search.id;
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
				startDate: moment().format('YYYY-MM-DD'),
				endDate: moment().format('YYYY-MM-DD'),
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
		$('.modal').modal('hide');
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
			this.args.milestones.unshiftObject(this.newMilestone);
			this.switchToMilestoneTab(this.newMilestone.id);
			
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
	 * This method switches to the specified milestone tab
	 *
	 * @method switchToMilestoneTab
	 * @param {String} milestoneId The ID of the milestone to switch to
	 * @public
	 */
	switchToMilestoneTab(milestoneId) {
		$(`[data-milestone-id="${milestoneId}"] a`).tab('show');
	}

	/**
	 * This action sets the provided milestone as active when a tab is clicked
	 *
	 * @method updateActiveMilestone
	 * @param {Object} milestone The milestone to update
	 * @public
	 */
	@action
	updateActiveMilestone(milestone) {
		Logger.debug("TaskBoardComponent::updateActiveMilestone");
		this.activeMilestone = milestone;
		this.closeCheckboxChecked = false;
		Logger.debug("-TaskBoardComponent::updateActiveMilestone");
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
		if (this.markMilestoneAsCompleteChecked) {
			// Checkbox was unchecked, close modal if open
			this.showMarkMilestoneAsCompleteModal = false;
		} else {
			// Checkbox was checked, set active milestone and open modal
			this.activeMilestone = this.getActiveMilestone();
			this.showMarkMilestoneAsCompleteModal = true;
			this.markMilestoneAsCompleteChecked = true;
		}
		
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
		this.markMilestoneAsCompleteChecked = false;
		$('.modal').modal('hide');
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
			if (this.args.markMilestoneAsComplete && this.activeMilestone) {
				await this.args.markMilestoneAsComplete(this.activeMilestone);
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
	 * This method gets the currently active milestone (the one being viewed).
	 *
	 * @method getActiveMilestone
	 * @returns {Object} The active milestone
	 * @public
	 */
	getActiveMilestone() {
		Logger.debug("TaskBoardComponent::getActiveMilestone");
		let milestoneId = document.querySelector('[data-milestone-tab].active').getAttribute('data-milestone-id');
		let milestone = this.args.milestones.findBy('id', milestoneId);
		milestone = milestone ? milestone : this.args.milestones.findBy('milestoneType', milestoneId);
		Logger.debug("-TaskBoardComponent::getActiveMilestone");
		return milestone;
	}

	/**
	 * This method sets the new active milestone.
	 *
	 * @method setNewActiveMilestone
	 * @public
	 */
	setNewActiveMilestone() {
		Logger.debug("TaskBoardComponent::setNewActiveMilestone");
		let newActiveMilestone = this.args.milestones.objectAt(0);
		if(newActiveMilestone) {
			this.activeMilestone = newActiveMilestone;
			document.querySelector(`[data-milestone-id="${newActiveMilestone.id}"] a`).click();
		}
		Logger.debug("-TaskBoardComponent::setNewActiveMilestone");
	}
}

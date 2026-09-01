/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from 'prometheus/controllers/prometheus';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { applyIssueAssigneeChange } from 'prometheus/utils/live/assignee';

/**
 * Gantt chart controller, including Hermes live handlers for dates,
 * dependencies, assignee, and issue-created events on the tracked project.
 *
 * @class AppProjectGanttController
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppProjectGanttController extends PrometheusController {

	/**
	 * Hermes socket client used to register gantt live events.
	 *
	 * @property hermes
	 * @type Ember.Service
	 * @for AppProjectGanttController
	 * @private
	 */
	@service hermes;

	/**
	 * Reload prompt shown when a live event cannot be applied in place.
	 *
	 * @property liveReloadPrompt
	 * @type Ember.Service
	 * @for AppProjectGanttController
	 * @private
	 */
	@service liveReloadPrompt;

	/**
	 * Disposer returned by hermes.register() for this screen.
	 *
	 * @property hermesDisposer
	 * @type Function|null
	 * @for AppProjectGanttController
	 * @private
	 */
	hermesDisposer = null;

	/**
	 * Milestone rows currently drawn on the chart.
	 *
	 * @property milestones
	 * @type Array
	 * @for AppProjectGanttController
	 * @public
	 */
	@tracked milestones = [];

	/**
	 * Timeline window start date (YYYY-MM-DD).
	 *
	 * @property timelineStart
	 * @type String|null
	 * @for AppProjectGanttController
	 * @public
	 */
	@tracked timelineStart = null;

	/**
	 * Timeline window end date (YYYY-MM-DD).
	 *
	 * @property timelineEnd
	 * @type String|null
	 * @for AppProjectGanttController
	 * @public
	 */
	@tracked timelineEnd = null;

	/**
	 * Incremented when live patches need the gantt to redraw.
	 *
	 * @property liveSyncRevision
	 * @type Number
	 * @for AppProjectGanttController
	 * @public
	 */
	@tracked liveSyncRevision = 0;

	/**
	 * The project controller
	 *
	 * @property projectController
	 * @type Ember.Controller
	 * @for AppProjectGanttController
	 */
	@controller('app.project') projectController;

	/**
	 * These are the query params that the controller supports.
	 *
	 * @property queryParams
	 * @type Array
	 * @for AppProjectGanttController
	 */
	queryParams = ['query'];

	/**
	 * This is the query that is used to filter the issues.
	 *
	 * @property query
	 * @type String
	 * @for AppProjectGanttController
	 */
	@tracked query = '';

	/**
	 * The currently selected issue for displaying details
	 *
	 * @property selectedIssue
	 * @type Object
	 * @for AppProjectGanttController
	 */
	@tracked selectedIssue = null;

	/**
	 * The issue currently displayed in the side panel
	 *
	 * @property panelIssue
	 * @type Object
	 * @for AppProjectGanttController
	 */
	@tracked panelIssue = null;

	/**
	 * Whether the issue details panel is open
	 *
	 * @property isIssuePanelOpen
	 * @type Boolean
	 * @for AppProjectGanttController
	 */
	@tracked isIssuePanelOpen = false;

	/**
	 * Tracking expanded milestones - stores IDs of expanded milestones
	 *
	 * @property expandedMilestones
	 * @type Set
	 * @for AppProjectGanttController
	 */
	@tracked expandedMilestones = new Set();

	/**
	 * Registers the gantt's Hermes intents for the tracked project.
	 *
	 * @method registerHermesIntents
	 * @param {String} projectId Tracked project id
	 * @returns {void}
	 * @public
	 */
	registerHermesIntents(projectId) {
		this.unregisterHermesIntents();
		if (!projectId) {
			return;
		}
		this.hermesDisposer = this.hermes.register(this, projectId, {
			'issue.dates.changed': this.handleIssueDatesChanged.bind(this),
			'issue.dependency.created': this.handleIssueDependencyCreated.bind(this),
			'issue.dependency.deleted': this.handleIssueDependencyDeleted.bind(this),
			'issue.assignee.changed': this.handleIssueAssigneeChanged.bind(this),
			'issue.created': this.handleIssueCreated.bind(this)
		});
	}

	/**
	 * Disposes the gantt's Hermes registration and clears the reload prompt.
	 *
	 * @method unregisterHermesIntents
	 * @returns {void}
	 * @public
	 */
	unregisterHermesIntents() {
		this.hermesDisposer?.();
		this.hermesDisposer = null;
		this.liveReloadPrompt.clear(this);
	}

	/**
	 * Finds an issue on the loaded milestones, then in the store.
	 *
	 * @method findIssueById
	 * @param {String} issueId Issue id
	 * @returns {Object|null}
	 * @private
	 */
	findIssueById(issueId) {
		for (let milestone of this.milestones || []) {
			let issue = milestone.issues?.findBy('id', issueId);
			if (issue) {
				return issue;
			}
		}
		return this.store.peekRecord('issue', issueId);
	}

	/**
	 * Applies issue.dates.changed and redraws the chart.
	 *
	 * @method handleIssueDatesChanged
	 * @param {Object} envelope V2 domain-event envelope
	 * @returns {void}
	 * @public
	 */
	handleIssueDatesChanged(envelope) {
		let issue = this.findIssueById(envelope.resource.id);
		if (!issue) {
			return;
		}
		let changes = envelope.changes || {};
		['startDate', 'endDate'].forEach((key) => {
			if (key in changes && issue.get(key) !== changes[key]) {
				issue.set(key, changes[key]);
			}
		});
		this.refreshGantt();
	}

	/**
	 * Applies issue.dependency.created onto the successor issue.
	 *
	 * @method handleIssueDependencyCreated
	 * @param {Object} envelope V2 domain-event envelope
	 * @returns {void}
	 * @public
	 */
	handleIssueDependencyCreated(envelope) {
		this.applyDependencyEvent(envelope, false);
	}

	/**
	 * Applies issue.dependency.deleted onto the successor issue.
	 *
	 * @method handleIssueDependencyDeleted
	 * @param {Object} envelope V2 domain-event envelope
	 * @returns {void}
	 * @public
	 */
	handleIssueDependencyDeleted(envelope) {
		this.applyDependencyEvent(envelope, true);
	}

	/**
	 * Patches parentId / parentissue from a dependency envelope and redraws.
	 *
	 * @method applyDependencyEvent
	 * @param {Object} envelope V2 domain-event envelope
	 * @param {Boolean} deleted True when the dependency was removed
	 * @returns {void}
	 * @private
	 */
	applyDependencyEvent(envelope, deleted) {
		let changes = envelope.changes || {};
		let issueId = changes.issueId
			|| changes.successorId
			|| envelope.meta?.successorIssueId
			|| envelope.resource.id;
		let issue = this.findIssueById(issueId);
		if (!issue) {
			return;
		}
		let parentId = deleted
			? null
			: changes.parentId
				|| changes.predecessorId
				|| envelope.meta?.parentIssueId
				|| envelope.meta?.predecessorIssueId
				|| null;
		let parent = parentId ? this.findIssueById(parentId) : null;
		if (issue.get('parentId') !== parentId) {
			issue.set('parentId', parentId);
		}
		if (issue.get('parentissue') !== parent) {
			issue.set('parentissue', parent);
		}
		this.refreshGantt();
	}

	/**
	 * Applies issue.assignee.changed and redraws the chart.
	 *
	 * @method handleIssueAssigneeChanged
	 * @param {Object} envelope V2 domain-event envelope
	 * @returns {void}
	 * @public
	 */
	handleIssueAssigneeChanged(envelope) {
		let issue = this.findIssueById(envelope.resource.id);
		applyIssueAssigneeChange(this.store, issue, envelope);
		if (issue) {
			this.refreshGantt();
		}
	}

	/**
	 * Prompts a reload when a new issue cannot be placed without a refresh.
	 *
	 * @method handleIssueCreated
	 * @returns {void}
	 * @public
	 */
	handleIssueCreated() {
		this.liveReloadPrompt.show(this, () => this.router.refresh());
	}

	/**
	 * Recalculates the timeline window and bumps liveSyncRevision so the
	 * chart redraws.
	 *
	 * @method refreshGantt
	 * @returns {void}
	 * @private
	 */
	refreshGantt() {
		let start = moment().startOf('day');
		let end = moment().add(3, 'months').endOf('day');
		(this.milestones || []).forEach((milestone) => {
			[milestone].concat(milestone.issues?.toArray?.() || milestone.issues || [])
				.forEach((item) => {
					if (item.startDate && moment(item.startDate).isBefore(start)) {
						start = moment(item.startDate);
					}
					if (item.endDate && moment(item.endDate).isAfter(end)) {
						end = moment(item.endDate);
					}
				});
		});
		this.timelineStart = start.subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
		this.timelineEnd = end.add(2, 'weeks').endOf('week').format('YYYY-MM-DD');
		this.liveSyncRevision++;
		this.milestones = [...this.milestones];
	}

	/**
	 * Auto-expand the first milestone (latest/top one) if no milestones are expanded
	 *
	 * @method autoExpandFirstMilestone
	 * @public
	 */
	autoExpandFirstMilestone() {
		if (this.expandedMilestones.size === 0 && this.milestones && this.milestones.length > 0) {
			const firstMilestone = this.milestones[0];
			if (firstMilestone && firstMilestone.id) {
				this.expandedMilestones = new Set([firstMilestone.id]);
			}
		}
	}

	/**
	 * This action is used to highlight an issue in both list and timeline views
	 * Toggles selection: if the same issue is clicked again, it will be deselected
	 *
	 * @method openIssue
	 * @param {Prometheus.Models.Issue} issue The issue to highlight
	 * @public
	 */
	@action openIssue(issue) {
		Logger.debug('AppProjectGanttController::openIssue');
		// Toggle selection: if clicking the same issue, deselect it
		if (this.selectedIssue?.id === issue?.id) {
			this.selectedIssue = null;
		} else {
			this.selectedIssue = issue;
		}
		Logger.debug('-AppProjectGanttController::openIssue');
	}

	/**
	 * This action is used to select an issue for displaying in a modal or sidebar
	 *
	 * @method selectIssue
	 * @param {Prometheus.Models.Issue} issue The issue to select
	 * @public
	 */
	@action selectIssue(issue) {
		Logger.debug('AppProjectGanttController::selectIssue');
		this.selectedIssue = issue;
		Logger.debug('-AppProjectGanttController::selectIssue');
	}

	/**
	 * This action is used to close the issue details
	 *
	 * @method closeIssueDetails
	 * @public
	 */
	@action closeIssueDetails() {
		Logger.debug('AppProjectGanttController::closeIssueDetails');
		this.selectedIssue = null;
		Logger.debug('-AppProjectGanttController::closeIssueDetails');
	}

	/**
	 * This action opens the issue details panel on double-click
	 *
	 * @method openIssuePanel
	 * @param {Prometheus.Models.Issue} issue The issue to display in the panel
	 * @public
	 */
	@action openIssuePanel(issue) {
		Logger.debug('AppProjectGanttController::openIssuePanel');
		if (issue) {
			this.panelIssue = issue;
			this.isIssuePanelOpen = true;
			this.selectedIssue = issue;
		}
		Logger.debug('-AppProjectGanttController::openIssuePanel');
	}

	/**
	 * This action closes the issue details panel
	 *
	 * @method closeIssuePanel
	 * @public
	 */
	@action closeIssuePanel() {
		Logger.debug('AppProjectGanttController::closeIssuePanel');
		this.isIssuePanelOpen = false;
		this.panelIssue = null;
		Logger.debug('-AppProjectGanttController::closeIssuePanel');
	}

	/**
	 * This action toggles the expand/collapse state of a milestone
	 *
	 * @method toggleMilestone
	 * @param {String} milestoneId The ID of the milestone to toggle
	 * @public
	 */
	@action toggleMilestone(milestoneId) {
		Logger.debug('AppProjectGanttController::toggleMilestone');
		let expanded = this.expandedMilestones;

		if (expanded.has(milestoneId)) {
			expanded.delete(milestoneId);
		} else {
			expanded.add(milestoneId);
		}

		// Trigger reactivity
		this.expandedMilestones = new Set(expanded);
		Logger.debug('-AppProjectGanttController::toggleMilestone');
	}

	/**
	 * Check if a milestone is expanded
	 *
	 * @method isMilestoneExpanded
	 * @param {String} milestoneId The ID of the milestone to check
	 * @returns {Boolean}
	 * @public
	 */
	@action isMilestoneExpanded(milestoneId) {
		return this.expandedMilestones.has(milestoneId);
	}

	/**
	 * This action updates the issue dates after drag and drop
	 *
	 * @method updateIssueDates
	 * @param {Prometheus.Models.Issue} issue The issue to update
	 * @param {String} newStartDate The new start date
	 * @param {String} newEndDate The new end date
	 * @public
	 */
	@action
	async updateIssueDates(issue, newStartDate, newEndDate) {
		Logger.debug('AppProjectGanttController::updateIssueDates');

		let messenger = new Messenger().post({
			message: htmlSafe(this.intl.t('views.app.gantt.issue.updating', {
				issueNumber: issue.issueNumber
			})),
			type: 'info',
			showCloseButton: false,
			hideAfter: false
		});

		try {
			// Update the issue dates
			issue.set('startDate', newStartDate);
			issue.set('endDate', newEndDate);

			// Save the issue
			await issue.save();

			messenger.update({
				message: htmlSafe(this.intl.t('views.app.gantt.issue.updated', {
					issueNumber: issue.issueNumber,
					startDate: moment(newStartDate).format('MMM DD, YYYY'),
					endDate: moment(newEndDate).format('MMM DD, YYYY')
				})),
				type: 'success',
				showCloseButton: true,
				hideAfter: 3
			});

			Logger.debug('-AppProjectGanttController::updateIssueDates');
		} catch (error) {
			Logger.error(
				'AppProjectGanttController::updateIssueDates - Error:',
				error
			);
			// Rollback the changes
			issue.rollbackAttributes();

			messenger.update({
				message: htmlSafe(this.intl.t('views.app.gantt.issue.updateError')),
				type: 'error',
				showCloseButton: true,
				hideAfter: 5
			});
			throw error;
		}
	}

	/**
	 * Create a finish-to-start dependency between two issues
	 *
	 * @method createDependency
	 * @param {Prometheus.Models.Issue} predecessorIssue
	 * @param {Prometheus.Models.Issue} successorIssue
	 * @public
	 */
	@action
	async createDependency(predecessorIssue, successorIssue) {
		if (!predecessorIssue || !successorIssue) {
			return;
		}

		if (successorIssue.parentId === predecessorIssue.id) {
			new Messenger().post({
				message: htmlSafe(this.intl.t('views.app.gantt.dependency.duplicate', {
					predecessor: predecessorIssue.issueNumber,
					successor: successorIssue.issueNumber
				})),
				type: 'info',
				hideAfter: 3,
				showCloseButton: true
			});
			return;
		}

		if (this.createsCircularDependency(predecessorIssue, successorIssue)) {
			new Messenger().post({
				message: htmlSafe(this.intl.t('views.app.gantt.dependency.cycleError', {
					predecessor: predecessorIssue.issueNumber,
					successor: successorIssue.issueNumber
				})),
				type: 'error',
				hideAfter: 5,
				showCloseButton: true
			});
			return;
		}

		let messenger = new Messenger().post({
			message: htmlSafe(this.intl.t('views.app.gantt.dependency.creating', {
				predecessor: predecessorIssue.issueNumber,
				successor: successorIssue.issueNumber
			})),
			type: 'info',
			showCloseButton: false,
			hideAfter: false
		});

		try {
			successorIssue.set('parentId', predecessorIssue.id);
			successorIssue.set('parentissue', predecessorIssue);

			await successorIssue.save();

			messenger.update({
				message: htmlSafe(this.intl.t('views.app.gantt.dependency.created', {
					predecessor: predecessorIssue.issueNumber,
					successor: successorIssue.issueNumber
				})),
				type: 'success',
				showCloseButton: true,
				hideAfter: 3
			});
		} catch (error) {
			Logger.error(
				'AppProjectGanttController::createDependency - Error:',
				error
			);

			successorIssue.rollbackAttributes();

			messenger.update({
				message: htmlSafe(this.intl.t('views.app.gantt.dependency.createError')),
				type: 'error',
				showCloseButton: true,
				hideAfter: 5
			});
		}
	}

	/**
	 * Check if linking the predecessor to the successor would create a cycle
	 *
	 * @method createsCircularDependency
	 * @param {Prometheus.Models.Issue} predecessor
	 * @param {Prometheus.Models.Issue} successor
	 * @returns {Boolean}
	 * @private
	 */
	createsCircularDependency(predecessor, successor) {
		let current = predecessor;
		while (current) {
			if (current.get('id') === successor.get('id')) {
				return true;
			}
			current = current.get('parentissue');
		}
		return false;
	}

	/**
	 * Delete an existing dependency between two issues (remove parent link)
	 *
	 * @method deleteDependency
	 * @param {Prometheus.Models.Issue} predecessorIssue
	 * @param {Prometheus.Models.Issue} successorIssue
	 * @public
	 */
	@action
	async deleteDependency(predecessorIssue, successorIssue) {
		if (!predecessorIssue || !successorIssue) {
			return;
		}

		// Only delete if this dependency actually exists
		if (successorIssue.parentId !== predecessorIssue.id) {
			return;
		}

		let messenger = new Messenger().post({
			message: htmlSafe(this.intl.t('views.app.gantt.dependency.deleting', {
				predecessor: predecessorIssue.issueNumber,
				successor: successorIssue.issueNumber
			})),
			type: 'info',
			showCloseButton: false,
			hideAfter: false
		});

		try {
			successorIssue.set('parentId', null);
			successorIssue.set('parentissue', null);

			await successorIssue.save();

			messenger.update({
				message: htmlSafe(this.intl.t('views.app.gantt.dependency.deleted', {
					predecessor: predecessorIssue.issueNumber,
					successor: successorIssue.issueNumber
				})),
				type: 'success',
				showCloseButton: true,
				hideAfter: 3
			});
		} catch (error) {
			Logger.error(
				'AppProjectGanttController::deleteDependency - Error:',
				error
			);
			successorIssue.rollbackAttributes();

			messenger.update({
				message: htmlSafe(this.intl.t('views.app.gantt.dependency.deleteError')),
				type: 'error',
				showCloseButton: true,
				hideAfter: 5
			});
		}
	}
}

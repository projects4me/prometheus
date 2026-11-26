/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from 'prometheus/controllers/prometheus';
import { action } from '@ember/object';
import { tracked, cached } from '@glimmer/tracking';
import { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { applyIssueAssigneeChange } from 'prometheus/utils/live/assignee';
import { refreshView } from 'prometheus/utils/live/reload';
import * as dates from 'prometheus/utils/date';
import { toArray } from 'prometheus/utils/array/to-array';
import { sumTimelogs } from 'prometheus/utils/gantt-progress';
import UrlState from 'prometheus/utils/state/url-state';

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
	 * Saves typed issue links.
	 *
	 * @property issueRelations
	 * @type {Prometheus.Services.IssueRelations}
	 * @public
	 */
	@service issueRelations;

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
	 * The issue preview service notification clicks are routed through.
	 *
	 * @property issuePreview
	 * @type Prometheus.Services.IssuePreviewService
	 * @public
	 */
	@service issuePreview;

	/**
	 * The viewport service: on phones the eye opens a bottom sheet and leaves the selection alone
	 *
	 * @property viewport
	 * @type ViewportService
	 * @public
	 */
	@service viewport;

	/**
	 * Disposer returned by issuePreview.register() for this screen.
	 *
	 * @property issuePreviewDisposer
	 * @type Function|null
	 * @private
	 */
	issuePreviewDisposer = null;

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
	 * The spent and estimated time logs of the shown issues, loaded by the route in their own query.
	 *
	 * @property timelogs
	 * @type Array
	 * @for AppProjectGanttController
	 * @public
	 */
	@tracked timelogs = [];

	/**
	 * The project's typed issue links (IssueLinkLookup), loaded by the route; the chart gets it as `@links`.
	 *
	 * @property links
	 * @type IssueLinkLookup
	 * @for AppProjectGanttController
	 * @public
	 */
	@tracked links = null;

	/**
	 * The logged time per issue (issue id → `{ spent, estimated }` minutes) the bars and the tooltip read.
	 *
	 * @property timeTotals
	 * @type Map
	 * @for AppProjectGanttController
	 * @public
	 */
	@cached
	get timeTotals() {
		return sumTimelogs(this.timelogs);
	}

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
	queryParams = ['query', 'searchId', 'issue'];

	/**
	 * The number of the issue whose quick view is open, 0 for none. Kept in the URL so a refresh reopens it.
	 *
	 * @property issue
	 * @type Number
	 * @for AppProjectGanttController
	 */
	@tracked issue = 0;

	/**
	 * The typed URL state of the open quick view.
	 *
	 * @property urlState
	 * @type UrlState
	 * @for AppProjectGanttController
	 */
	urlState = new UrlState(this, {
		schema: { issue: { default: 0, type: 'number' } },
		routeName: 'app.project.gantt'
	});

	constructor() {
		super(...arguments);
		this.urlState.onChange((values) => this.showIssueFromUrl(values.issue));
	}

	/**
	 * Finds a loaded issue by its number.
	 *
	 * @method findIssueByNumber
	 * @param {Number} number The issue number
	 * @returns {Prometheus.Models.Issue|null}
	 * @private
	 */
	findIssueByNumber(number) {
		for (let milestone of this.milestones || []) {
			let issue = milestone.issues?.find((item) => Number(item.issueNumber) === number);
			if (issue) {
				return issue;
			}
		}
		return null;
	}

	/**
	 * Opens (or closes, for 0) the quick view for the number in the URL, without writing the URL again.
	 * A number that is not on the chart is dropped from the URL.
	 *
	 * @method showIssueFromUrl
	 * @param {Number} number The issue number, 0 for none
	 * @public
	 */
	showIssueFromUrl(number) {
		if (!number) {
			this.closeIssuePanel(false);
			return;
		}
		let issue = this.findIssueByNumber(number);
		if (issue) {
			this.openIssuePanel(issue, false);
			this.scrollRequest = issue;
		} else if (this.milestones?.length) {
			this.urlState.set({ issue: 0 });
		}
	}

	/**
	 * The issue the chart should scroll into view, set when the URL opened it.
	 *
	 * @property scrollRequest
	 * @type Prometheus.Models.Issue
	 * @for AppProjectGanttController
	 */
	@tracked scrollRequest = null;

	/**
	 * This is the query that is used to filter the issues.
	 *
	 * @property query
	 * @type String
	 * @for AppProjectGanttController
	 */
	@tracked query = '';

	/**
	 * The id of the saved search the query came from, null for none.
	 *
	 * @property searchId
	 * @type String
	 * @for AppProjectGanttController
	 */
	@tracked searchId = null;

	/**
	 * The ezSearch schema of the issues, set by the route; null hides the search.
	 *
	 * @property querySchema
	 * @type Object
	 * @for AppProjectGanttController
	 */
	@tracked querySchema = null;

	/**
	 * The saved issue searches of the user in this project, set by the route.
	 *
	 * @property savedsearches
	 * @type Array
	 * @for AppProjectGanttController
	 */
	@tracked savedsearches = [];

	/**
	 * Runs a query from ezSearch; the route reloads the chart for it.
	 *
	 * @method applyQuery
	 * @param {String} query The Gaia query, empty for none
	 * @for AppProjectGanttController
	 */
	@action
	applyQuery(query) {
		this.query = query || null;
	}

	/**
	 * Marks a saved search as the active one, or clears the mark.
	 *
	 * @method selectSavedSearch
	 * @param {Object|null} search The picked item or null
	 * @for AppProjectGanttController
	 */
	@action
	selectSavedSearch(search) {
		this.searchId = search ? String(search.id) : null;
	}

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
			let issue = milestone.issues?.find((item) => item.id === issueId);
			if (issue) {
				return issue;
			}
		}
		return this.store.peekRecord('issue', issueId);
	}

	/**
	 * Finds an issue among the gantt's loaded milestones (not the store).
	 *
	 * @method findLoadedIssue
	 * @param {String} issueId Issue id
	 * @returns {Object|null}
	 * @private
	 */
	findLoadedIssue(issueId) {
		for (let milestone of this.milestones || []) {
			let issue = milestone.issues?.find((item) => item.id === issueId);
			if (issue) {
				return issue;
			}
		}
		return null;
	}

	/**
	 * Registers the gantt as the issue preview target: an issue on the chart
	 * opens in the gantt's issue panel.
	 *
	 * @method registerIssuePreview
	 * @returns {void}
	 * @public
	 */
	registerIssuePreview() {
		this.unregisterIssuePreview();
		this.issuePreviewDisposer = this.issuePreview.register(this, {
			hasIssue: (issueId) => Boolean(this.findLoadedIssue(issueId)),
			open: (issueId) => this.openIssuePanel(this.findLoadedIssue(issueId))
		});
	}

	/**
	 * Disposes the gantt's issue preview registration.
	 *
	 * @method unregisterIssuePreview
	 * @returns {void}
	 * @public
	 */
	unregisterIssuePreview() {
		this.issuePreviewDisposer?.();
		this.issuePreviewDisposer = null;
	}

	/**
	 * Applies issue.dates.changed and redraws the chart.
	 *
	 * @method handleIssueDatesChanged
	 * @param {Object} envelope Domain-event envelope
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
	 * @param {Object} envelope Domain-event envelope
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
	 * @param {Object} envelope Domain-event envelope
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
	 * @param {Object} envelope Domain-event envelope
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
	 * @param {Object} envelope Domain-event envelope
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
	 * Skips the prompt for the creating user (local echo can beat noteLocalWrite).
	 *
	 * @method handleIssueCreated
	 * @param {Object} envelope Domain-event envelope
	 * @returns {void}
	 * @public
	 */
	handleIssueCreated(envelope) {
		if (envelope?.actorId && envelope.actorId === this.currentUser.user?.id) {
			Logger.debug('AppProjectGanttController::handleIssueCreated - suppressed self-origin reload prompt');
			return;
		}
		this.liveReloadPrompt.show(this, () => refreshView(this.router));
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
		let start = dates.startOf(dates.now(), 'day');
		let end = dates.endOf(dates.add(dates.now(), 3, 'months'), 'day');
		(this.milestones || []).forEach((milestone) => {
			[milestone].concattoArray(milestone.issues)
				.forEach((item) => {
					if (item.startDate && dates.isBefore(item.startDate, start)) {
						start = dates.parse(item.startDate);
					}
					if (item.endDate && dates.isAfter(item.endDate, end)) {
						end = dates.parse(item.endDate);
					}
				});
		});
		this.timelineStart = dates.format(dates.startOf(dates.subtract(start, 1, 'week'), 'week'), 'YYYY-MM-DD');
		this.timelineEnd = dates.format(dates.endOf(dates.add(end, 2, 'weeks'), 'week'), 'YYYY-MM-DD');
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
	 * This action selects an issue in both the list and the timeline. Selecting an issue that is already
	 * selected keeps it selected.
	 *
	 * @method openIssue
	 * @param {Prometheus.Models.Issue} issue The issue to highlight
	 * @public
	 */
	@action openIssue(issue) {
		Logger.debug('AppProjectGanttController::openIssue');
		this.selectedIssue = issue;
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
	@action openIssuePanel(issue, writeUrl = true) {
		Logger.debug('AppProjectGanttController::openIssuePanel');
		if (issue) {
			if (writeUrl !== false) {
				this.urlState.set({ issue: Number(issue.issueNumber) || 0 });
			}
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
	@action closeIssuePanel(writeUrl = true) {
		Logger.debug('AppProjectGanttController::closeIssuePanel');
		if (writeUrl !== false) {
			this.urlState.set({ issue: 0 });
		}
		this.isIssuePanelOpen = false;
		this.panelIssue = null;
		this.scrollRequest = null;
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
	 * Ids of the parent issues whose children are collapsed, on both sides of the grid
	 *
	 * @property collapsedIssues
	 * @type Set
	 * @public
	 */
	@tracked collapsedIssues = new Set();

	/**
	 * Collapses or expands the children of a parent issue
	 *
	 * @method toggleIssue
	 * @param {String} issueId The parent issue's id
	 * @public
	 */
	@action toggleIssue(issueId) {
		let collapsed = new Set(this.collapsedIssues);
		if (collapsed.has(issueId)) {
			collapsed.delete(issueId);
		} else {
			collapsed.add(issueId);
		}
		this.collapsedIssues = collapsed;
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
			message: this.intl.t('views.app.gantt.issue.updating', {
				issueNumber: issue.issueNumber, htmlSafe: true }),
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
				message: this.intl.t('views.app.gantt.issue.updated', {
					issueNumber: issue.issueNumber,
					startDate: dates.format(newStartDate, 'MMM DD, YYYY'),
					endDate: dates.format(newEndDate, 'MMM DD, YYYY'), htmlSafe: true }),
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
				message: this.intl.t('views.app.gantt.issue.updateError', { htmlSafe: true }),
				type: 'error',
				showCloseButton: true,
				hideAfter: 5
			});
			throw error;
		}
	}

	/**
	 * The pending link waiting for its type: `{ source, target, x, y }`, or null. Set on drop, cleared on choose or cancel.
	 *
	 * @property linkPicker
	 * @type Object|null
	 * @public
	 */
	@tracked linkPicker = null;

	/**
	 * Opens the link type picker for a dropped link dot. `source` blocks/splits into/relates to `target`.
	 *
	 * @method createDependency
	 * @param {Prometheus.Models.Issue} source
	 * @param {Prometheus.Models.Issue} target
	 * @param {Object} point Drop point `{ x, y }` in viewport pixels
	 * @public
	 */
	@action
	createDependency(source, target, point = {}) {
		if (!source || !target) {
			return;
		}
		this.linkPicker = { source, target, x: point.x, y: point.y };
	}

	/**
	 * Closes the link type picker without linking.
	 *
	 * @method cancelLinkPicker
	 * @public
	 */
	@action
	cancelLinkPicker() {
		this.linkPicker = null;
	}

	/**
	 * Saves the pending link with the chosen relation through issueRelations.link() and draws it at once. Gaia's
	 * refusal (422) is shown in a danger Messenger.
	 *
	 * @method saveLink
	 * @param {String} relation blocks, splitsInto or relates
	 * @public
	 */
	@action
	async saveLink(relation) {
		let pending = this.linkPicker;
		this.linkPicker = null;
		if (!pending) {
			return;
		}
		try {
			let link = await this.issueRelations.link(pending.source, relation, pending.target);
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			this.links?.add(link);
		} catch (error) {
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			Logger.error('AppProjectGanttController::saveLink - Error:', error);
			new Messenger().post({
				message: error?.errors?.[0]?.detail
					|| error?.errors?.[0]?.title
					|| this.intl.t('views.app.gantt.linkPicker.failed'),
				type: 'error',
				showCloseButton: true,
				hideAfter: 5
			});
		}
	}

	/**
	 * Deletes a typed link through issueRelations.unlink() and removes its line at once. Gaia's refusal is shown in
	 * a danger Messenger.
	 *
	 * @method deleteLink
	 * @param {Issuelink} link
	 * @public
	 */
	@action
	async deleteLink(link) {
		if (!link) {
			return;
		}
		try {
			await this.issueRelations.unlink(link.belongsTo('sourceIssue').value(), { link });
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			this.links?.remove(link);
		} catch (error) {
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			Logger.error('AppProjectGanttController::deleteLink - Error:', error);
			new Messenger().post({
				message: error?.errors?.[0]?.detail
					|| error?.errors?.[0]?.title
					|| this.intl.t('views.app.gantt.dependency.deleteError', { htmlSafe: true }),
				type: 'error',
				showCloseButton: true,
				hideAfter: 5
			});
		}
	}

	/**
	 * The issue whose phone edit sheet is open, or null.
	 *
	 * @property editIssue
	 * @type Prometheus.Models.Issue|null
	 * @public
	 */
	@tracked editIssue = null;

	/**
	 * Opens the phone edit sheet (dates and dependencies) for an issue.
	 *
	 * @method openEditSheet
	 * @param {Prometheus.Models.Issue} issue
	 * @public
	 */
	@action
	openEditSheet(issue) {
		this.editIssue = issue;
	}

	/**
	 * The issue whose Link issue modal is open (from the phone selection bar), or null.
	 *
	 * @property linkIssue
	 * @type Prometheus.Models.Issue|null
	 * @public
	 */
	@tracked linkIssue = null;

	/**
	 * Opens Link issue for an issue.
	 *
	 * @method openLinkIssue
	 * @param {Prometheus.Models.Issue} issue
	 * @public
	 */
	@action
	openLinkIssue(issue) {
		this.linkIssue = issue;
	}

	/**
	 * Closes Link issue.
	 *
	 * @method closeLinkIssue
	 * @public
	 */
	@action
	closeLinkIssue() {
		this.linkIssue = null;
	}

	/**
	 * Closes the phone edit sheet.
	 *
	 * @method closeEditSheet
	 * @public
	 */
	@action
	closeEditSheet() {
		this.editIssue = null;
	}

	/**
	 * Goes to the issue page.
	 *
	 * @method openIssuePage
	 * @param {Prometheus.Models.Issue} issue
	 * @public
	 */
	@action
	openIssuePage(issue) {
		this.router.transitionTo('app.project.issue.page', issue.issueNumber);
	}

	/**
	 * Reloads the project's links lookup, after the edit sheet added dependencies.
	 *
	 * @method reloadLinks
	 * @public
	 */
	@action
	async reloadLinks() {
		try {
			let links = await this.issueRelations.linksOfProject(this.trackedProject.id);
			if (!this.isDestroying && !this.isDestroyed) {
				this.links = links;
			}
		} catch (error) {
			Logger.error('AppProjectGanttController::reloadLinks - Error:', error);
		}
	}
}

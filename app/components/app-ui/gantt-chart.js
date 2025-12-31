/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from 'prometheus/components/app';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
	generateDateRange,
	groupDatesByMonth,
	getTotalDays,
	calculateBarPosition
} from 'prometheus/utils/gantt-helpers';
import { guidFor } from '@ember/object/internals';

/**
 * This component renders the main Gantt chart view with timeline and milestones/issues
 *
 * @class GanttChartComponent
 * @namespace Prometheus.Components.AppUi
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class GanttChartComponent extends AppComponent {
	/**
	 * Constructor for GanttChartComponent
	 *
	 * @constructor
	 * @public
	 */
	constructor() {
		super(...arguments);
		this.gridPatternId = `gantt-grid-${guidFor(this)}`;
	}
	/**
	 * Width of a single day column in pixels
	 *
	 * @property dayWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	dayWidth = 40;

	/**
	 * Registry of rendered task bars so we can calculate dependency positions
	 *
	 * @property barRegistry
	 * @type Object
	 * @for GanttChartComponent
	 * @private
	 */
	barRegistry = Object.create(null);

	/**
	 * A monotonically increasing counter used to trigger dependency layer updates
	 *
	 * @property barRegistryVersion
	 * @type Number
	 * @for GanttChartComponent
	 * @private
	 */
	@tracked barRegistryVersion = 0;

	/**
	 * Tracks the element of the scrollable timeline body for coordinate mapping
	 *
	 * @property timelineBodyElement
	 * @type HTMLElement|null
	 * @for GanttChartComponent
	 * @private
	 */
	@tracked timelineBodyElement = null;

	/**
	 * Tracks the scrollable timeline container element
	 *
	 * @property timelineContainerElement
	 * @type HTMLElement|null
	 * @for GanttChartComponent
	 * @private
	 */
	@tracked timelineContainerElement = null;

	/**
	 * Describes the currently active dependency link interaction (if any)
	 *
	 * @property linkingState
	 * @type Object|null
	 * @for GanttChartComponent
	 * @private
	 */
	@tracked linkingState = null;

	/**
	 * Current time scale filter (days | weeks)
	 *
	 * @property timeScale
	 * @type String
	 * @public
	 */
	@tracked timeScale = 'days';

	/**
	 * Computed property that generates the date range for the timeline
	 *
	 * @property dateRange
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get dateRange() {
		if (!this.args.timelineStart || !this.args.timelineEnd) {
			return [];
		}
		return generateDateRange(
			this.args.timelineStart,
			this.args.timelineEnd
		);
	}

	/**
	 * Computed property that groups dates by month for the header
	 *
	 * @property monthGroups
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get monthGroups() {
		let m = groupDatesByMonth(this.dateRange);
		return m;
	}

	/**
	 * Computed property that calculates the total number of days
	 *
	 * @property totalDays
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	get totalDays() {
		if (!this.args.timelineStart || !this.args.timelineEnd) {
			return 0;
		}
		return getTotalDays(this.args.timelineStart, this.args.timelineEnd);
	}

	/**
	 * Computed property that calculates the total width of the timeline
	 *
	 * @property timelineWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	get timelineWidth() {
		return this.totalDays * this.dayWidth;
	}

	/**
	 * Height of a single row in pixels
	 *
	 * @property rowHeight
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	rowHeight = 45;

	/**
	 * Width of the grid pattern in pixels
	 *
	 * @property gridPatternWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	get gridPatternWidth() {
		return Math.max(this.dayWidth, 1);
	}

	/**
	 * Apply styles to grid overlay SVG element
	 *
	 * @method applyGridOverlayStyle
	 * @param {SVGElement} element
	 * @public
	 */
	@action
	applyGridOverlayStyle(element) {
		if (element) {
			element.style.width = `${this.timelineWidth}px`;
			element.style.height = '100%';
		}
	}

	/**
	 * Apply styles to weekend overlay element
	 *
	 * @method applyWeekendOverlayStyle
	 * @param {HTMLElement} element
	 * @public
	 */
	@action
	applyWeekendOverlayStyle(element) {
		if (element) {
			element.style.width = `${this.timelineWidth}px`;
			element.style.height = '100%';
		}
	}

	/**
	 * Apply styles to weekend block element
	 *
	 * @method applyWeekendBlockStyle
	 * @param {Object} highlight
	 * @param {HTMLElement} element
	 * @public
	 */
	@action
	applyWeekendBlockStyle(highlight, element) {
		if (element && highlight) {
			element.style.left = `${highlight.left}px`;
			element.style.width = `${highlight.width}px`;
		}
	}

	/**
	 * Get the vertical path for the grid pattern
	 *
	 * @property gridVerticalPath
	 * @type String
	 * @for GanttChartComponent
	 * @public
	 */
	get gridVerticalPath() {
		return `M ${this.gridPatternWidth} 0 V ${this.rowHeight}`;
	}

	/**
	 * Get the horizontal path for the grid pattern
	 *
	 * @property gridHorizontalPath
	 * @type String
	 * @for GanttChartComponent
	 * @public
	 */
	get gridHorizontalPath() {
		return `M 0 ${this.rowHeight} H ${this.gridPatternWidth}`;
	}

	/**
	 * Check if the week scale should be shown
	 *
	 * @property showWeekScale
	 * @type Boolean
	 * @for GanttChartComponent
	 * @public
	 */
	get showWeekScale() {
		return this.timeScale === 'weeks';
	}

	/**
	 * Get the year groups for the timeline
	 *
	 * @property yearGroups
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get yearGroups() {
		let groups = [];
		let current = null;

		this.dateRange.forEach((day) => {
			let year = moment(day.date).year();
			if (!current || current.year !== year) {
				current = {
					year,
					days: 0
				};
				groups.push(current);
			}
			current.days++;
		});

		return groups;
	}

	/**
	 * Get the week groups for the timeline
	 *
	 * @property weekGroups
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get weekGroups() {
		if (!this.showWeekScale) {
			return [];
		}

		let groups = [];
		let current = null;

		this.dateRange.forEach((day) => {
			let dayMoment = moment(day.date);
			let week = dayMoment.isoWeek();
			let year = dayMoment.isoWeekYear();

			if (!current || current.week !== week || current.year !== year) {
				current = {
					week,
					year,
					days: 0
				};
				groups.push(current);
			}
			current.days++;
		});

		return groups;
	}

	/**
	 * Check if the week scale should be shown
	 *
	 * @property showWeekScale
	 * @type Boolean
	 * @for GanttChartComponent
	 * @public
	 */
	get showWeekScale() {
		return this.timeScale === 'weeks';
	}

	/**
	 * Get the year groups for the timeline
	 *
	 * @property yearGroups
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get yearGroups() {
		let groups = [];
		let current = null;

		this.dateRange.forEach((day) => {
			let year = moment(day.date).year();
			if (!current || current.year !== year) {
				current = {
					year,
					days: 0
				};
				groups.push(current);
			}
			current.days++;
		});

		return groups;
	}

	/**
	 * Get the week groups for the timeline
	 *
	 * @property weekGroups
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get weekGroups() {
		if (!this.showWeekScale) {
			return [];
		}

		let groups = [];
		let current = null;

		this.dateRange.forEach((day) => {
			let dayMoment = moment(day.date);
			let week = dayMoment.isoWeek();
			let year = dayMoment.isoWeekYear();
			if (!current || current.week !== week || current.year !== year) {
				current = {
					week,
					year,
					days: 0
				};
				groups.push(current);
			}
			current.days++;
		});

		return groups;
	}

	/**
	 * Get the weekend highlights for the timeline
	 *
	 * @property weekendHighlights
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get weekendHighlights() {
		let dayWidth = this.dayWidth;

		return this.dateRange
			.map((date, index) => ({
				isWeekend: [0, 6].includes(moment(date.date).day()),
				left: index * dayWidth
			}))
			.filter((item) => item.isWeekend)
			.map(({ left }) => ({
				left,
				width: dayWidth
			}));
	}

	/**
	 * Change time scale between days and weeks
	 *
	 * @method setTimeScale
	 * @param {String} scale
	 */
	@action
	setTimeScale(scale) {
		if (scale && this.timeScale !== scale) {
			this.timeScale = scale;
		}
	}

	/**
	 * Flatten all milestone issues into a single array for convenience
	 *
	 * @property allIssues
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get allIssues() {
		let issues = [];
		(this.args.milestones || []).forEach((milestone) => {
			if (milestone?.issues) {
				issues.push(
					...(milestone.issues.toArray?.() || milestone.issues)
				);
			}
		});
		return issues;
	}

	/**
	 * Build the dependency list based on issue parentId relationships
	 *
	 * @property dependencies
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get dependencies() {
		let deps = [];
		let issueMap = this.issueMap;

		this.allIssues.forEach((issue) => {
			let parentId = issue.parentId;
			if (parentId && issueMap[parentId]) {
				deps.push({
					fromIssueId: parentId,
					toIssueId: issue.id
				});
			}
		});

		return deps;
	}

	/**
	 * Map issue ids to their instances for quick lookup
	 *
	 * @property issueMap
	 * @type Object
	 * @for GanttChartComponent
	 * @private
	 */
	get issueMap() {
		let map = Object.create(null);
		this.allIssues.forEach((issue) => {
			if (issue?.id) {
				map[issue.id] = issue;
			}
		});
		return map;
	}

	/**
	 * Track drag offsets for bars currently being dragged
	 * Maps issueId -> dragOffset in pixels
	 *
	 * @property draggedBars
	 * @type Object
	 * @for GanttChartComponent
	 * @private
	 */
	draggedBars = Object.create(null);

	/**
	 * Get the drag offset for a specific issue
	 *
	 * @property getDragOffset
	 * @param {String} issueId
	 * @returns {Number}
	 * @for GanttChartComponent
	 * @public
	 */
	@action getDragOffset(issueId) {
		return this.draggedBars[issueId] || 0;
	}

	/**
	 * Indicates whether we are currently linking dependencies
	 *
	 * @property isLinking
	 * @type Boolean
	 * @for GanttChartComponent
	 * @public
	 */
	get isLinking() {
		return Boolean(this.linkingState);
	}

	/**
	 * Action to toggle milestone expand/collapse
	 *
	 * @method toggleMilestone
	 * @param {String} milestoneId The ID of the milestone to toggle
	 * @public
	 */
	@action
	toggleMilestone(milestoneId) {
		if (this.args.onToggleMilestone) {
			this.args.onToggleMilestone(milestoneId);
		}
	}

	/**
	 * Action to handle issue click
	 *
	 * @method handleIssueClick
	 * @param {Object} issue The issue that was clicked
	 * @public
	 */
	@action
	handleIssueClick(issue) {
		const isCurrentlySelected = this.args.selectedIssue?.id === issue?.id;
		const isSelecting = !isCurrentlySelected;

		if (this.args.onIssueClick) {
			this.args.onIssueClick(issue);
		}
		if (isSelecting) {
			this.scrollToIssue(issue);
		}
	}

	/**
	 * Scroll the timeline to show the specified issue
	 * Scrolls both horizontally (to the bar position) and vertically (to the row position)
	 *
	 * @method scrollToIssue
	 * @param {Object} issue The issue to scroll to
	 * @public
	 */
	@action
	scrollToIssue(issue) {
		if (!issue || !issue.startDate || !this.timelineContainerElement || !this.timelineBodyElement) {
			return;
		}

		// Calculate horizontal scroll position (x-axis)
		const barLeft = calculateBarPosition(
			this.args.timelineStart,
			issue.startDate,
			this.dayWidth
		);

		const containerWidth = this.timelineContainerElement.clientWidth;
		const scrollLeft = Math.max(0, barLeft - (containerWidth / 2) + (this.dayWidth * 2));

		// Find the issue row element for vertical scroll (y-axis)
		const issueRow = this.timelineBodyElement.querySelector(
			`.gantt-timeline-row[data-issue-id="${issue.id}"]`
		);

		let scrollTop = this.timelineContainerElement.scrollTop;

		if (issueRow) {
			const rowRect = issueRow.getBoundingClientRect();
			const containerRect = this.timelineContainerElement.getBoundingClientRect();
			const rowTop = rowRect.top - containerRect.top + this.timelineContainerElement.scrollTop;
			const containerHeight = this.timelineContainerElement.clientHeight;
			const rowHeight = rowRect.height;

			// Center the row vertically in the viewport
			scrollTop = Math.max(0, rowTop - (containerHeight / 2) + (rowHeight / 2));
		}

		this.timelineContainerElement.scrollTo({
			left: scrollLeft,
			top: scrollTop,
			behavior: 'smooth'
		});
	}

	/**
	 * Action to handle issue drag start
	 *
	 * @method handleIssueDragStart
	 * @param {Object} issue The issue that started dragging
	 * @public
	 */
	@action
	handleIssueDragStart(issue) {
		if (issue?.id) {
			this.draggedBars[issue.id] = 0;
			// Trigger dependency layer refresh
			this.updateBarRegisteryVersion();
		}
	}

	/**
	 * Action to handle issue drag update (during drag)
	 *
	 * @method handleIssueDragUpdate
	 * @param {Object} issue The issue being dragged
	 * @param {Number} dragOffset The current drag offset in pixels
	 * @public
	 */
	@action
	handleIssueDragUpdate(issue, dragOffset) {
		if (issue?.id) {
			this.draggedBars[issue.id] = dragOffset;
			// Trigger dependency layer refresh to update arrow positions
			// getBoundingClientRect() will read the current CSS position
			this.updateBarRegisteryVersion();
		}
	}

	/**
	 * Action to handle issue drag end
	 *
	 * @method handleIssueDragEnd
	 * @param {Object} issue The issue that was dragged
	 * @param {String} newStartDate The new start date
	 * @param {String} newEndDate The new end date
	 * @public
	 */
	@action
	handleIssueDragEnd(issue, newStartDate, newEndDate) {
		// Keep drag offset visible during save for smooth arrow updates
		// The offset will be cleared after save completes
		if (this.args.onIssueDragEnd) {
			// Wrap the callback to handle cleanup after save
			const wrappedCallback = async () => {
				try {
					await this.args.onIssueDragEnd(
						issue,
						newStartDate,
						newEndDate
					);
				} catch (error) {
					console.error('handleIssueDragEnd - Error:', error);
				} finally {
					// Clear drag offset and refresh arrows after save completes
					if (issue?.id) {
						delete this.draggedBars[issue.id];
						this.updateBarRegisteryVersion();
					}
				}
			};

			return wrappedCallback();
		} else {
			// No save callback, clear immediately
			if (issue?.id) {
				delete this.draggedBars[issue.id];
				this.updateBarRegisteryVersion();
			}
		}
	}

	/**
	 * Action to handle issue resize start
	 *
	 * @method handleIssueResizeStart
	 * @param {Object} issue The issue that is being resized
	 * @public
	 */
	@action
	handleIssueResizeStart(issue) {
		if (issue?.id) {
			this.updateBarRegisteryVersion();
		}
	}

	/**
	 * Action to handle issue resize update (during resize)
	 *
	 * @method handleIssueResizeUpdate
	 * @param {Object} issue The issue that is being resized
	 * @param {String} resizeHandle 'left' or 'right'
	 * @param {Number} resizeOffset The current resize offset in pixels
	 * @public
	 */
	@action
	handleIssueResizeUpdate(issue, resizeHandle, resizeOffset) {
		if (issue?.id) {
			this.updateBarRegisteryVersion();
		}
	}

	/**
	 * Action to handle issue resize end
	 *
	 * @method handleIssueResizeEnd
	 * @param {Object} issue The issue that was resized
	 * @param {String} newStartDate The new start date
	 * @param {String} newEndDate The new end date
	 * @public
	 */
	@action
	handleIssueResizeEnd(issue, newStartDate, newEndDate) {
		if (this.args.onIssueResizeEnd) {
			const wrappedCallback = async () => {
				try {
					await this.args.onIssueResizeEnd(
						issue,
						newStartDate,
						newEndDate
					);
				} catch (error) {
					console.error('handleIssueResizeEnd - Error:', error);
				} finally {
					if (issue?.id) {
						this.updateBarRegisteryVersion();
					}
				}
			};

			return wrappedCallback();
		} else {
			if (issue?.id) {
				this.updateBarRegisteryVersion();
			}
		}
	}

	/**
	 * Handle delete dependency action from dependency layer context menu
	 *
	 * @method handleDeleteDependency
	 * @param {String} fromIssueId
	 * @param {String} toIssueId
	 * @public
	 */
	@action
	handleDeleteDependency(fromIssueId, toIssueId) {
		let predecessor = this.issueMap[fromIssueId];
		let successor = this.issueMap[toIssueId];

		if (!predecessor || !successor) {
			return;
		}

		if (this.args.onDeleteDependency) {
			this.args.onDeleteDependency(predecessor, successor);
		}
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
		if (this.args.isMilestoneExpanded) {
			return this.args.isMilestoneExpanded(milestoneId);
		}
		// Default to collapsed if backlog, expanded otherwise
		return milestoneId !== null && milestoneId !== 'backlog';
	}

	/**
	 * Capture the timeline body element to calculate dependency positions
	 *
	 * @method registerTimelineBody
	 * @param {HTMLElement} element
	 * @public
	 */
	@action registerTimelineBody(element) {
		this.timelineBodyElement = element;
		this.timelineBodyElement.style.width = `${this.timelineWidth}px`;
	}

	/**
	 * Clear the stored timeline body reference when component is destroyed
	 *
	 * @method unregisterTimelineBody
	 * @public
	 */
	@action unregisterTimelineBody() {
		this.timelineBodyElement = null;
	}

	/**
	 * Capture the timeline container element for scrolling
	 *
	 * @method registerTimelineContainer
	 * @param {HTMLElement} element
	 * @public
	 */
	@action registerTimelineContainer(element) {
		this.timelineContainerElement = element;
	}

	/**
	 * Clear the stored timeline container reference when component is destroyed
	 *
	 * @method unregisterTimelineContainer
	 * @public
	 */
	@action unregisterTimelineContainer() {
		this.timelineContainerElement = null;
	}

	/**
	 * Register a rendered issue bar element for dependency calculations
	 *
	 * @method registerIssueBar
	 * @param {String} issueId
	 * @param {HTMLElement} element
	 * @public
	 */
	@action registerIssueBar(issueId, element) {
		if (!issueId || !element) {
			return;
		}
		this.barRegistry[issueId] = element;
		this.updateBarRegisteryVersion();
	}

	/**
	 * Unregister an issue bar element when it's destroyed
	 *
	 * @method unregisterIssueBar
	 * @param {String} issueId
	 * @public
	 */
	@action unregisterIssueBar(issueId) {
		if (!issueId) {
			return;
		}
		delete this.barRegistry[issueId];
		this.updateBarRegisteryVersion();
	}

	/**
	 * Begin creating a dependency by clicking on a connector
	 * Sets up linking state and tracks mouse movement for preview line
	 *
	 * @method startDependencyLink
	 * @param {Object} issue
	 * @param {String} anchor
	 * @param {Event} event
	 * @public
	 */
	@action startDependencyLink(issue, anchor, event) {
		if (!issue || !this.timelineBodyElement) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		let startPoint = this.getConnectorPoint(issue.id, anchor);

		if (!startPoint) {
			const containerRect =
				this.timelineBodyElement.getBoundingClientRect();
			startPoint = {
				x:
					event.clientX -
					containerRect.left +
					this.timelineBodyElement.scrollLeft,
				y:
					event.clientY -
					containerRect.top +
					this.timelineBodyElement.scrollTop
			};
		}

		this.linkingState = {
			sourceIssue: issue,
			sourceAnchor: anchor,
			pointer: startPoint
		};

		// Track mouse movement for preview line visualization
		// Connection will be completed via click
		document.addEventListener('mousemove', this.handleGlobalMouseMove);
	}

	/**
	 * Complete the dependency link if user drops on another connector
	 *
	 * @method completeDependencyLink
	 * @param {Object} issue
	 * @param {String} anchor
	 * @param {Event} event
	 * @public
	 */
	@action completeDependencyLink(issue, anchor, event) {
		if (!this.linkingState || !issue) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		let sourceIssue = this.linkingState.sourceIssue;

		// Ignore same issue connections
		if (sourceIssue.id === issue.id) {
			this.resetLinkingState();
			return;
		}

		let dependency = null;

		if (this.linkingState.sourceAnchor === 'end' && anchor === 'start') {
			dependency = {
				predecessor: sourceIssue,
				successor: issue
			};
		} else if (
			this.linkingState.sourceAnchor === 'start' &&
			anchor === 'end'
		) {
			dependency = {
				predecessor: issue,
				successor: sourceIssue
			};
		}

		if (dependency && this.args.onCreateDependency) {
			this.args.onCreateDependency(
				dependency.predecessor,
				dependency.successor
			);
		}

		this.resetLinkingState();
	}

	/**
	 * Cancel dependency link interaction
	 *
	 * @method cancelDependencyLink
	 * @public
	 */
	@action cancelDependencyLink() {
		this.resetLinkingState();
	}

	/**
	 * Track pointer movement during dependency link drag
	 *
	 * @method handleGlobalMouseMove
	 * @param {MouseEvent} event
	 * @public
	 */
	@action handleGlobalMouseMove(event) {
		if (!this.linkingState || !this.timelineBodyElement) {
			return;
		}

		const containerRect = this.timelineBodyElement.getBoundingClientRect();
		this.linkingState = {
			...this.linkingState,
			pointer: {
				x:
					event.clientX -
					containerRect.left +
					this.timelineBodyElement.scrollLeft,
				y:
					event.clientY -
					containerRect.top +
					this.timelineBodyElement.scrollTop
			}
		};
	}

	/**
	 * Reset linking state and detach global listeners
	 *
	 * @method resetLinkingState
	 * @private
	 */
	resetLinkingState() {
		document.removeEventListener('mousemove', this.handleGlobalMouseMove);
		this.linkingState = null;
	}

	/**
	 * Calculate connector coordinates for an issue
	 *
	 * @method getConnectorPoint
	 * @param {String} issueId
	 * @param {String} anchor
	 * @returns {{x:Number,y:Number}|null}
	 * @private
	 */
	getConnectorPoint(issueId, anchor) {
		let container = this.timelineBodyElement;
		let element = this.barRegistry[issueId];

		if (!container || !element) {
			return null;
		}

		const containerRect = container.getBoundingClientRect();
		const rect = element.getBoundingClientRect();

		const x = anchor === 'start' ? rect.left : rect.right;
		const y = rect.top + rect.height / 2;

		return {
			x: x - containerRect.left + container.scrollLeft,
			y: y - containerRect.top + container.scrollTop
		};
	}

	/**
	 * Update the bar registry version
	 *
	 * @method updateBarRegisteryVersion
	 * @public
	 */
	@action
	updateBarRegisteryVersion() {
		this.barRegistryVersion++;
	}

	/**
	 * Reset linking state and detach global listeners when component is destroyed
	 *
	 * @method willDestroy
	 * @public
	 */
	willDestroy() {
		super.willDestroy(...arguments);
		this.resetLinkingState();
	}
}

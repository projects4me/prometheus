/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from 'prometheus/components/app';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import {
	generateDateRange,
	groupDatesByMonth,
	getTotalDays,
	calculateBarPosition,
	getMilestoneKey,
	GANTT_ROW_HEIGHT,
	toFiniteNumber,
	getValidIssues,
	countUndatedIssues
} from 'prometheus/utils/gantt-helpers';
import { guidFor } from '@ember/object/internals';
import * as dates from 'prometheus/utils/date';
import { toArray } from 'prometheus/utils/array/to-array';
import { loadToolbarPreferences, saveToolbarPreferences } from 'prometheus/utils/gantt/toolbar-preferences';

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
		const saved = loadToolbarPreferences();
		this.timeScale = saved.scale;
		this.showDependencies = saved.dependencies;
		this.showWeekends = saved.weekends;
		this.gridPatternId = `gantt-grid-${guidFor(this)}`;
	}

	/**
	 * The viewport service: `isPhone` is true below 768px and updates live
	 *
	 * @property viewport
	 * @type ViewportService
	 * @public
	 */
	@service viewport;

	/**
	 * The store, for the status legend
	 *
	 * @property store
	 * @type StoreService
	 * @public
	 */
	@service store;

	/**
	 * The intl service, for the footer's plural texts
	 *
	 * @property intl
	 * @type IntlService
	 * @public
	 */
	@service intl;

	/**
	 * The tab shown on phones: `timeline` (default) or `list`. Kept when the viewport crosses 768px.
	 *
	 * @property phoneTab
	 * @type String
	 * @default 'timeline'
	 * @public
	 */
	@tracked phoneTab = 'timeline';

	/**
	 * Action to switch the phone tab
	 *
	 * @method setPhoneTab
	 * @param {String} tab `list` or `timeline`
	 * @param {Event} [event] click event; its default (hash navigation) is prevented
	 * @public
	 */
	@action
	setPhoneTab(tab, event) {
		event?.preventDefault();
		this.phoneTab = tab;
	}
	/**
	 * Width of a single day column in pixels for days view
	 *
	 * @property dayWidthValue
	 * @type Number
	 * @for GanttChartComponent
	 * @private
	 */
	dayWidthValue = 80;

	/**
	 * Width of a single day column in pixels for weeks view
	 *
	 * @property weekWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	weekWidth = 35;

	/**
	 * Width of a single day column in pixels (dynamic based on timeScale)
	 *
	 * @property dayWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	get dayWidth() {
		if (this.timeScale === 'months') {
			return this.monthDayWidth;
		}
		return this.timeScale === 'weeks' ? this.weekWidth : this.dayWidthValue;
	}

	/**
	 * Width of a single day in pixels for the months view (a month is about 120px)
	 *
	 * @property monthDayWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	monthDayWidth = 4;

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
	 * Combined bar + live-sync stamp used to redraw dependency lines after a
	 * remote patch bumps `@liveSyncRevision` without a local drag.
	 *
	 * @property dependencyRegistryVersion
	 * @type String
	 * @for GanttChartComponent
	 * @private
	 */
	get dependencyRegistryVersion() {
		return `${this.barRegistryVersion}-${this.args.liveSyncRevision || 0}`;
	}

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
	 * The grid column (desktop only), sticky on the left of the timeline container
	 *
	 * @property gridColumnElement
	 * @type HTMLElement|null
	 * @for GanttChartComponent
	 * @private
	 */
	gridColumnElement = null;

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
	 * Animation frame ID for auto-scroll during dependency linking
	 *
	 * @property autoScrollFrameId
	 * @type Number|null
	 * @for GanttChartComponent
	 * @private
	 */
	autoScrollFrameId = null;

	/**
	 * Scroll zone threshold in pixels (distance from edge to trigger scroll)
	 *
	 * @property scrollZone
	 * @type Number
	 * @for GanttChartComponent
	 * @private
	 */
	scrollZone = 20;

	/**
	 * Scroll speed in pixels per frame (constant speed)
	 *
	 * @property scrollSpeed
	 * @type Number
	 * @for GanttChartComponent
	 * @private
	 */
	scrollSpeed = 15;

	/**
	 * Current horizontal scroll speed
	 *
	 * @property currentScrollX
	 * @type Number
	 * @for GanttChartComponent
	 * @private
	 */
	currentScrollX = 0;

	/**
	 * The issue the shared bar tooltip shows.
	 *
	 * @property tooltipIssue
	 * @type {Object}
	 * @default null
	 */
	@tracked tooltipIssue = null;

	/**
	 * The element holding the shared bar tooltip content.
	 *
	 * @property tooltipElement
	 * @type {Element}
	 * @default null
	 */
	@tracked tooltipElement = null;

	/**
	 * Remember the tooltip content element so bars can show it.
	 *
	 * @method registerTooltipElement
	 * @param {Element} element
	 */
	@action
	registerTooltipElement(element) {
		this.tooltipElement = element;
	}

	/**
	 * A bar was hovered or focused: show its issue in the shared tooltip.
	 *
	 * @method showTooltipIssue
	 * @param {Object} issue
	 */
	@action
	showTooltipIssue(issue) {
		this.tooltipIssue = issue;
	}

	/**
	 * Current time scale filter (days | weeks)
	 *
	 * @property timeScale
	 * @type String
	 * @public
	 */
	@tracked timeScale = 'weeks';

	/**
	 * The scales of the toolbar's button group
	 *
	 * @property scales
	 * @type Array
	 * @public
	 */
	scales = ['days', 'weeks', 'months'];

	/**
	 * Whether the dependency layer is drawn; remembered per user
	 *
	 * @property showDependencies
	 * @type Boolean
	 * @public
	 */
	@tracked showDependencies = true;

	/**
	 * Whether the weekend columns are shaded; remembered per user
	 *
	 * @property showWeekends
	 * @type Boolean
	 * @public
	 */
	@tracked showWeekends = true;

	/**
	 * The project's issue statuses for the legend, one per name, in the order the store holds them
	 *
	 * @property legendStatuses
	 * @type Array
	 * @public
	 */
	get legendStatuses() {
		const seen = new Set();
		return this.store.peekAll('issuestatus').filter((status) => {
			if (!status.name || seen.has(status.name)) {
				return false;
			}
			seen.add(status.name);
			return true;
		});
	}

	/**
	 * The footer's right side: the timeline's date range and the counts of what the chart shows
	 * ("16 Nov – 10 Jan · 3 milestones · 4 issues shown · 1 without dates"). The undated part is left out at 0.
	 *
	 * @property footerSummary
	 * @type String
	 * @public
	 */
	get footerSummary() {
		void this.args.liveSyncRevision;
		const milestones = toArray(this.args.milestones);
		const parts = [];
		if (this.args.timelineStart && this.args.timelineEnd) {
			parts.push(
				`${dates.format(this.args.timelineStart, 'D MMM')} – ${dates.format(this.args.timelineEnd, 'D MMM')}`
			);
		}
		const shown = milestones.reduce((total, milestone) => total + getValidIssues(milestone).length, 0);
		const undated = countUndatedIssues(milestones);
		parts.push(this.intl.t('components.gantt.footer.milestones', { count: milestones.length }));
		parts.push(this.intl.t('components.gantt.footer.issuesShown', { count: shown }));
		if (undated > 0) {
			parts.push(this.intl.t('components.gantt.footer.withoutDates', { count: undated }));
		}
		return parts.join(' · ');
	}

	/**
	 * Saves the scale and both toggles under the one documented key
	 *
	 * @method savePreferences
	 * @private
	 */
	savePreferences() {
		saveToolbarPreferences({
			scale: this.timeScale,
			dependencies: this.showDependencies,
			weekends: this.showWeekends
		});
	}

	/**
	 * Shows or hides the dependency lines
	 *
	 * @method toggleDependencies
	 * @public
	 */
	@action
	toggleDependencies() {
		this.showDependencies = !this.showDependencies;
		this.savePreferences();
	}

	/**
	 * Shows or hides the weekend shading
	 *
	 * @method toggleWeekends
	 * @public
	 */
	@action
	toggleWeekends() {
		this.showWeekends = !this.showWeekends;
		this.savePreferences();
	}

	/**
	 * Scrolls the timeline sideways so today is centred (clamped by the browser at the ends)
	 *
	 * @method scrollToToday
	 * @public
	 */
	@action
	scrollToToday() {
		if (!this.timelineContainerElement || !this.args.timelineStart) {
			return;
		}
		const today = dates.format(dates.now(), 'YYYY-MM-DD');
		const todayLeft = calculateBarPosition(this.args.timelineStart, today, this.dayWidth);
		const left = Math.max(0, todayLeft - (this.timelineViewportWidth / 2) + (this.dayWidth / 2));
		this.timelineContainerElement.scrollTo({ left, behavior: 'auto' });
	}

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
	 * The index of today in the date range (its day count from the timeline start), or null when today is outside it.
	 * The today line positions itself from this with the root `--gantt-day-width`.
	 *
	 * @property todayOffset
	 * @type Number|null
	 * @for GanttChartComponent
	 * @public
	 */
	get todayOffset() {
		const today = dates.format(dates.now(), 'YYYY-MM-DD');
		const index = this.dateRange.findIndex((day) => day.date === today);
		return index === -1 ? null : index;
	}

	/**
	 * The today line's position as a CSS custom property in days; the SCSS centres it in today's day column.
	 * Empty when today is outside the timeline.
	 *
	 * @property todayLineStyle
	 * @type SafeString|null
	 * @for GanttChartComponent
	 * @public
	 */
	get todayLineStyle() {
		const offset = this.todayOffset;
		return offset === null ? null : htmlSafe(`--today-start: ${toFiniteNumber(offset)}`);
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
	rowHeight = GANTT_ROW_HEIGHT;

	/**
	 * Custom properties on the chart root: row height, day width and timeline width. A scale change only
	 * changes this one style; header cells, spans and bars compute their size from it in the SCSS.
	 *
	 * @property rootStyle
	 * @type SafeString
	 * @public
	 */
	get rootStyle() {
		return htmlSafe(
			`--gantt-row-height: ${toFiniteNumber(this.rowHeight)}px; ` +
			`--gantt-day-width: ${toFiniteNumber(this.dayWidth)}px; ` +
			`--gantt-timeline-width: ${toFiniteNumber(this.timelineWidth)}px`
		);
	}

	/**
	 * Width of one day column in the grid pattern, in pixels
	 *
	 * @property gridDayWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	get gridDayWidth() {
		return Math.max(this.dayWidth, 1);
	}

	/**
	 * Width of the grid pattern: one week of seven day columns
	 *
	 * @property gridPatternWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	get gridPatternWidth() {
		return this.gridDayWidth * 7;
	}

	/**
	 * Horizontal offset of the week pattern so that each tile starts on a Monday
	 *
	 * @property gridPatternX
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	get gridPatternX() {
		if (!this.args.timelineStart) {
			return 0;
		}
		const mondayIndex = (dates.part(this.args.timelineStart, 'day') + 6) % 7;
		return mondayIndex === 0 ? 0 : -mondayIndex * this.gridDayWidth;
	}

	/**
	 * Left edge of the Saturday/Sunday shading inside the week pattern
	 *
	 * @property gridWeekendX
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	get gridWeekendX() {
		return this.gridDayWidth * 5;
	}

	/**
	 * Width of the Saturday/Sunday shading inside the week pattern
	 *
	 * @property gridWeekendWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	get gridWeekendWidth() {
		return this.gridDayWidth * 2;
	}

	/**
	 * Get the vertical path for the grid pattern: one line at the end of each of the seven days
	 *
	 * @property gridVerticalPath
	 * @type String
	 * @for GanttChartComponent
	 * @public
	 */
	get gridVerticalPath() {
		if (this.timeScale === 'months') {
			// a day is a few pixels wide: day lines would only be noise
			return '';
		}
		const lines = [];
		for (let day = 1; day <= 7; day++) {
			lines.push(`M ${day * this.gridDayWidth} 0 V ${this.rowHeight}`);
		}
		return lines.join(' ');
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
			let year = dates.part(day.date, 'year');
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
			let week = dates.part(day.date, 'isoWeek');
			let year = dates.part(day.date, 'isoWeekYear');

			if (!current || current.week !== week || current.year !== year) {
				current = {
					week,
					year,
					startDate: day.date,
					label: dates.format(day.date, 'D MMM'),
					days: 0
				};
				groups.push(current);
			}
			current.days++;
		});

		return groups;
	}

	/**
	 * Change time scale between days and weeks. Only the root `--gantt-day-width` changes, so the switch
	 * is immediate; the dependency lines follow the bars while their size transition plays.
	 *
	 * @method setTimeScale
	 * @param {String} scale
	 */
	@action
	setTimeScale(scale) {
		if (!scale || this.timeScale === scale) {
			return;
		}
		this.timeScale = scale;
		this.savePreferences();
		// The new scale renders before the next frame
		requestAnimationFrame(() => {
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			if (this.args.selectedIssue) {
				this.scrollToIssue(this.args.selectedIssue);
			}
		});
		this.followBarTransition();
	}

	/**
	 * Flatten all milestone issues into a single array for convenience.
	 * Reads `@liveSyncRevision` so Glimmer invalidates this getter (and
	 * dependents like `dependencies`) when a Hermes live patch lands.
	 *
	 * @property allIssues
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get allIssues() {
		void this.args.liveSyncRevision;
		let issues = [];
		(this.args.milestones || []).forEach((milestone) => {
			if (milestone?.issues) {
				issues.push(
					...toArray(milestone.issues)
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
	 * Action to handle a bar click: selects the issue; the list scrolls to and marks it through `@activeId`
	 *
	 * @method handleIssueClick
	 * @param {Object} issue The issue that was clicked
	 * @public
	 */
	@action
	handleIssueClick(issue) {
		this.args.onIssueClick?.(issue);
	}

	/**
	 * Action to handle a list item click: selects the issue, expands its milestone when collapsed and, once
	 * the bar is rendered, scrolls it into view
	 *
	 * @method handleListSelect
	 * @param {Object} issue The issue that was clicked
	 * @public
	 */
	@action
	handleListSelect(issue) {
		this.args.onIssueClick?.(issue);
		const milestone = (this.args.milestones ?? []).find((m) => (m.issues ?? []).includes(issue));
		if (milestone) {
			const key = getMilestoneKey(milestone);
			if (!this.isMilestoneExpanded(key)) {
				this.toggleMilestone(key);
			}
		}
		const scroll = () => {
			if (!this.isDestroying && !this.isDestroyed) {
				this.scrollToIssue(issue);
			}
		};
		if (this.viewport.isPhone) {
			// the timeline is hidden until its tab renders; scroll once it has a size
			this.phoneTab = 'timeline';
			requestAnimationFrame(() => requestAnimationFrame(scroll));
		} else {
			requestAnimationFrame(scroll);
		}
	}

	/**
	 * Action to handle a grid row click: selects the issue and scrolls the timeline sideways to its bar
	 *
	 * @method handleGridSelect
	 * @param {Object} issue The issue that was clicked
	 * @public
	 */
	@action
	handleGridSelect(issue) {
		this.args.onIssueClick?.(issue);
		this.scrollToIssue(issue, { vertical: false });
	}

	/**
	 * Action to handle issue number link click (opens panel)
	 *
	 * @method handleOpenIssuePanel
	 * @param {Object} issue The issue that was clicked
	 * @public
	 */
	@action
	handleOpenIssuePanel(issue) {
		if (this.args.onOpenIssuePanel) {
			this.args.onOpenIssuePanel(issue);
		}
	}

	/**
	 * Scroll the timeline to show the specified issue
	 * Scrolls both horizontally (to the bar position) and vertically (to the row position)
	 *
	 * @method scrollToIssue
	 * @param {Object} issue The issue to scroll to
	 * @param {Object} [options] `{ vertical }`: false keeps the vertical position
	 * @public
	 */
	@action
	scrollToIssue(issue, { vertical = true } = {}) {
		if (!issue || !issue.startDate || !this.timelineContainerElement || !this.timelineBodyElement) {
			return;
		}

		// Calculate horizontal scroll position (x-axis)
		const barLeft = calculateBarPosition(
			this.args.timelineStart,
			issue.startDate,
			this.dayWidth
		);

		const containerWidth = this.timelineViewportWidth;
		const scrollLeft = Math.max(0, barLeft - (containerWidth / 2) + (this.dayWidth * 2));

		// Find the issue row element for vertical scroll (y-axis)
		const issueRow = this.timelineBodyElement.querySelector(
			`.gantt-timeline-row[data-issue-id="${issue.id}"]`
		);

		let scrollTop = this.timelineContainerElement.scrollTop;

		if (issueRow && vertical) {
			const rowRect = issueRow.getBoundingClientRect();
			const containerRect = this.timelineContainerElement.getBoundingClientRect();
			const rowTop = rowRect.top - containerRect.top + this.timelineContainerElement.scrollTop;
			const containerHeight = this.timelineContainerElement.clientHeight;
			const rowHeight = this.rowHeight;

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
	 * Capture the grid column, which sticks over the left of the timeline container
	 *
	 * @method registerGridColumn
	 * @param {HTMLElement} element
	 * @public
	 */
	@action registerGridColumn(element) {
		this.gridColumnElement = element;
	}

	/**
	 * Width of the grid column sticking over the left of the timeline container (0 on phones)
	 *
	 * @property gridWidth
	 * @type Number
	 * @public
	 */
	get gridWidth() {
		return this.gridColumnElement?.isConnected ? this.gridColumnElement.offsetWidth : 0;
	}

	/**
	 * Width of the part of the timeline container that shows the timeline, beside the grid
	 *
	 * @property timelineViewportWidth
	 * @type Number
	 * @public
	 */
	get timelineViewportWidth() {
		return (this.timelineContainerElement?.clientWidth ?? 0) - this.gridWidth;
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

		// Check for auto-scroll during dependency linking
		this.checkAndStartAutoScrollForLinking(event);
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
		this.stopAutoScroll();
	}

	/**
	 * Check if cursor is near container boundaries and start auto-scroll if needed (for dependency linking)
	 *
	 * @method checkAndStartAutoScrollForLinking
	 * @param {Event} event The mouse event
	 * @private
	 */
	checkAndStartAutoScrollForLinking(event) {
		const container = this.timelineContainerElement;
		if (!container) {
			return;
		}

		const rect = container.getBoundingClientRect();
		const mouseX = event.clientX;

		const distFromLeft = mouseX - (rect.left + this.gridWidth);
		const distFromRight = rect.right - mouseX;

		let scrollX = 0;

		if (distFromLeft < this.scrollZone) {
			scrollX = -this.scrollSpeed;
		} else if (distFromRight < this.scrollZone) {
			scrollX = this.scrollSpeed;
		}

		// Start or continue auto-scroll if needed
		if (scrollX !== 0) {
			// Update scroll direction/speed
			this.currentScrollX = scrollX;
			
			if (!this.autoScrollFrameId) {
				this.performAutoScroll(container, (scrollDeltaX) => {
					if (this.linkingState) {
						this.linkingState = {
							...this.linkingState,
							pointer: {
								...this.linkingState.pointer,
								x: this.linkingState.pointer.x + scrollDeltaX
							}
						};
					}
				});
			}
		} else {
			this.stopAutoScroll();
		}
	}

	/**
	 * Auto-scroll animation method (DRY - used by drag, resize, and dependency linking)
	 *
	 * @method performAutoScroll
	 * @param {HTMLElement} container The timeline container element
	 * @param {Function} scrollSyncCallback Callback to handle scroll sync
	 * @private
	 */
	performAutoScroll(container, scrollSyncCallback) {
		const scroll = () => {
			if (!container || !this.currentScrollX) {
				this.stopAutoScroll();
				return;
			}

			const currentScrollX = container.scrollLeft;
			const maxScrollX = container.scrollWidth - container.clientWidth;

			let newScrollX = currentScrollX + this.currentScrollX;
			newScrollX = Math.max(0, Math.min(maxScrollX, newScrollX));

			if (newScrollX !== currentScrollX) {
				const scrollDeltaX = newScrollX - currentScrollX;
				container.scrollLeft = newScrollX;
				
				if (scrollSyncCallback && typeof scrollSyncCallback === 'function') {
					scrollSyncCallback(scrollDeltaX);
				}
			}

			if (this.autoScrollFrameId && this.currentScrollX !== 0) {
				this.autoScrollFrameId = requestAnimationFrame(scroll);
			} else {
				this.stopAutoScroll();
			}
		};

		this.autoScrollFrameId = requestAnimationFrame(scroll);
	}

	/**
	 * Check and start auto-scroll based on bar position.
	 * Uses cursor movement direction as primary, edge-based direction as fallback.
	 *
	 * @method checkAndStartAutoScrollForBar
	 * @param {Number} barLeft Bar's left position in timeline
	 * @param {Number} barWidth Bar's width in pixels
	 * @param {Number} cursorDeltaX Cursor movement direction (positive = right, negative = left, 0 = not moving)
	 * @param {Function} scrollSyncCallback Callback to handle scroll sync
	 * @public
	 */
	@action
	checkAndStartAutoScrollForBar(barLeft, barWidth, cursorDeltaX, scrollSyncCallback) {
		const container = this.timelineContainerElement;
		if (!container) {
			return;
		}

		const barRight = barLeft + barWidth;

		const containerScrollLeft = container.scrollLeft;
		const containerVisibleLeft = containerScrollLeft;
		const containerVisibleRight = containerScrollLeft + this.timelineViewportWidth;

		const barDistFromLeftEdge = barLeft - containerVisibleLeft;
		const barDistFromRightEdge = containerVisibleRight - barRight;

		// Check if bar is near/outside edges (determines IF we should scroll)
		const isLeftEdgeInThreshold = barDistFromLeftEdge < this.scrollZone;
		const isRightEdgeInThreshold = barDistFromRightEdge < this.scrollZone;

		// If bar is not near any edge, don't scroll
		if (!isLeftEdgeInThreshold && !isRightEdgeInThreshold) {
			this.stopAutoScroll();
			return;
		}

		let scrollX = 0;

		// Primary: Use cursor movement direction if cursor is moving
		if (cursorDeltaX !== 0) {
			if (cursorDeltaX > 0) {
				scrollX = this.scrollSpeed;
			} else {
				scrollX = -this.scrollSpeed;
			}
		} else {
			// Fallback: Use edge-based direction when cursor is not moving
			if (isLeftEdgeInThreshold) {
				scrollX = -this.scrollSpeed;
			} else if (isRightEdgeInThreshold) {
				scrollX = this.scrollSpeed;
			}
		}

		if (scrollX !== 0) {
			this.currentScrollX = scrollX;
			
			if (!this.autoScrollFrameId) {
				this.performAutoScroll(container, scrollSyncCallback);
			}
		} else {
			this.stopAutoScroll();
		}
	}

	/**
	 * Stop auto-scroll animation
	 *
	 * @method stopAutoScroll
	 * @public
	 */
	@action
	stopAutoScroll() {
		if (this.autoScrollFrameId) {
			cancelAnimationFrame(this.autoScrollFrameId);
			this.autoScrollFrameId = null;
		}
		this.currentScrollX = 0;
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
	 * Refresh the dependency positions on every frame for a short while, so the lines follow the bars
	 * while their left/width transition plays after a scale change.
	 *
	 * @method followBarTransition
	 * @public
	 */
	followBarTransition() {
		let frames = 0;
		const refresh = () => {
			if (this.isDestroying || this.isDestroyed) {
				return;
			}
			this.updateBarRegisteryVersion();
			frames++;
			if (frames < 30) {
				requestAnimationFrame(refresh);
			}
		};
		requestAnimationFrame(refresh);
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
		this.stopAutoScroll();
	}
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { isConflict } from 'prometheus/utils/gantt/conflicts';
import AppComponent from 'prometheus/components/app';
import { tracked, cached } from '@glimmer/tracking';
import { TimeAxis, HOURS_SCALE } from 'prometheus/utils/gantt/time-axis';
import { WORK_HOURS_PER_DAY } from 'prometheus/utils/gantt/working-time';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import {
	generateDateRange,
	groupDatesByMonth,
	getMilestoneKey,
	GANTT_ROW_HEIGHT,
	toFiniteNumber,
	getValidIssues,
	countUndatedIssues
} from 'prometheus/utils/gantt-helpers';
import { guidFor } from '@ember/object/internals';
import * as dates from 'prometheus/utils/date';
import { toArray } from 'prometheus/utils/array/to-array';
import { LINK_TYPES, DEFAULT_LINK_TYPES, loadToolbarPreferences, saveToolbarPreferences, loadPhonePreferences, savePhonePreferences } from 'prometheus/utils/gantt/toolbar-preferences';

/**
 * The narrowest Gantt container (in px) that shows the issue quick view as a side column: the grid (~430px)
 * and a usable stretch of timeline next to a panel of at least 360px. Below it the quick view opens as the
 * bottom sheet. The container, not the viewport, decides: side panels (the navigation sidebar, a browser side
 * panel) squeeze the content while the viewport stays wide.
 *
 * @property QUICK_VIEW_SIDE_PANEL_MIN_WIDTH
 * @type Number
 * @final
 */
export const QUICK_VIEW_SIDE_PANEL_MIN_WIDTH = 900;

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
		// phones open on Days around today, whatever scale the desktop remembers
		this.timeScale = this.viewport.isPhone ? 'days' : saved.scale;
		// phones keep their own layer options: lines and labels off until turned on
		const layers = this.viewport.isPhone ? loadPhonePreferences() : saved;
		this.linkTypes = layers.links;
		this.showOtherProjects = layers.otherProjects;
		this.showWeekends = layers.weekends;
		this.showLabels = this.viewport.isPhone ? layers.labels : true;
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
	 * The measured width of the Gantt container, in px; 0 until it is measured
	 *
	 * @property containerWidth
	 * @type Number
	 * @default 0
	 * @public
	 */
	@tracked containerWidth = 0;

	/**
	 * Records the Gantt container's width (the `observe-width` callback)
	 *
	 * @method setContainerWidth
	 * @param {Number} width
	 * @public
	 */
	@action
	setContainerWidth(width) {
		if (!this.isDestroying && !this.isDestroyed) {
			this.containerWidth = width;
		}
	}

	/**
	 * Whether the issue quick view opens as the bottom sheet rather than the side column: on phones, and when
	 * the Gantt container is narrower than QUICK_VIEW_SIDE_PANEL_MIN_WIDTH
	 *
	 * @property quickViewAsSheet
	 * @type Boolean
	 * @public
	 */
	get quickViewAsSheet() {
		if (this.viewport.isPhone) {
			return true;
		}
		return this.containerWidth > 0 && this.containerWidth < QUICK_VIEW_SIDE_PANEL_MIN_WIDTH;
	}

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
		if (this.timeScale === HOURS_SCALE) {
			return this.hourWidth * WORK_HOURS_PER_DAY;
		}
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
	 * Width of one working hour in pixels for the hours view
	 *
	 * @property hourWidth
	 * @type Number
	 * @for GanttChartComponent
	 * @public
	 */
	hourWidth = 40;

	/**
	 * Whether the Hours scale (the working-time axis) is shown
	 *
	 * @property isHours
	 * @type Boolean
	 * @for GanttChartComponent
	 * @public
	 */
	get isHours() {
		return this.timeScale === HOURS_SCALE;
	}

	/**
	 * The timeline's axis for the scale: where dates and planned moments lie, in day columns. Rows, bars,
	 * the today line and scrolling all position through it.
	 *
	 * @property timeAxis
	 * @type TimeAxis
	 * @for GanttChartComponent
	 * @public
	 */
	@cached
	get timeAxis() {
		return new TimeAxis(this.args.timelineStart, this.args.timelineEnd, this.timeScale);
	}

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
	scales = [HOURS_SCALE, 'days', 'weeks', 'months'];

	/**
	 * The link types drawn (`blocks`, `splits`, `relates`); none hides the line layer. Remembered per user.
	 *
	 * @property linkTypes
	 * @type Array
	 * @public
	 */
	@tracked linkTypes = [...DEFAULT_LINK_TYPES];

	/**
	 * Whether issues of other projects show (the ghost rows); remembered per user
	 *
	 * @property showOtherProjects
	 * @type Boolean
	 * @public
	 */
	@tracked showOtherProjects = true;

	/**
	 * The link types the Links dropdown offers
	 *
	 * @property linkTypeOptions
	 * @type Array
	 * @public
	 */
	linkTypeOptions = LINK_TYPES;

	/**
	 * Whether any line is drawn; the layer is left out when no link type is chosen
	 *
	 * @property showDependencies
	 * @type Boolean
	 * @public
	 */
	get showDependencies() {
		return this.linkTypes.length > 0;
	}

	/**
	 * Whether a phone draws only the selected issue's links: the Dependency lines option is off
	 *
	 * @property showSelectedLinksOnly
	 * @type Boolean
	 * @public
	 */
	get showSelectedLinksOnly() {
		return this.viewport.isPhone && !this.showDependencies;
	}

	/**
	 * Whether the dependency layer is rendered: lines are on, or a phone has an issue selected
	 *
	 * @property showDependencyLayer
	 * @type Boolean
	 * @public
	 */
	get showDependencyLayer() {
		return this.showDependencies || (this.showSelectedLinksOnly && Boolean(this.args.selectedIssue));
	}

	/**
	 * The link types as the Links field's options (value and translated label)
	 *
	 * @property linkOptions
	 * @type Array
	 * @public
	 */
	get linkOptions() {
		return LINK_TYPES.map((type) => ({ value: type, label: this.intl.t(`components.gantt.links.${type}`) }));
	}

	/**
	 * The chosen link types, as the Links field's chips
	 *
	 * @property selectedLinkOptions
	 * @type Array
	 * @public
	 */
	get selectedLinkOptions() {
		return this.linkOptions.filter((option) => this.linkTypes.includes(option.value));
	}

	/**
	 * Whether the weekend columns are shaded; remembered per user
	 *
	 * @property showWeekends
	 * @type Boolean
	 * @public
	 */
	@tracked showWeekends = true;

	/**
	 * Whether the bars carry their labels; always on for desktop, a remembered option on phones
	 *
	 * @property showLabels
	 * @type Boolean
	 * @public
	 */
	@tracked showLabels = true;

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
	 * First timeline pixel in view, in timeline coordinates (the part beside the frozen column)
	 *
	 * @property visibleStart
	 * @type Number
	 * @default 0
	 * @private
	 */
	@tracked visibleStart = 0;

	/**
	 * Width in pixels of the timeline part in view; 0 until measured
	 *
	 * @property visibleWidth
	 * @type Number
	 * @default 0
	 * @private
	 */
	@tracked visibleWidth = 0;

	/**
	 * Animation frame of a pending visible-range update (the scroll listener is throttled with it)
	 *
	 * @property visibleFrameId
	 * @type Number
	 * @private
	 */
	visibleFrameId = null;

	/**
	 * The pixel window `{ start, end }` the edge chips compare the bars with; null off phones or unmeasured
	 *
	 * @property chipWindow
	 * @type Object
	 * @public
	 */
	get chipWindow() {
		if (!this.viewport.isPhone || this.visibleWidth <= 0) {
			return null;
		}
		return { start: this.visibleStart, end: this.visibleStart + this.visibleWidth };
	}

	/**
	 * The visible dates as text, such as "22 \u2013 29 Nov" or "28 Nov \u2013 4 Dec"; empty until measured
	 *
	 * @property visibleRangeLabel
	 * @type String
	 * @public
	 */
	get visibleRangeLabel() {
		if (this.visibleWidth <= 0 || !this.args.timelineStart || !this.dayWidth) {
			return '';
		}
		const axis = this.timeAxis;
		const firstColumn = Math.floor(this.visibleStart / this.dayWidth);
		const first = axis.dateAt(firstColumn);
		const last = axis.dateAt(firstColumn + Math.max(0, Math.ceil(this.visibleWidth / this.dayWidth) - 1));
		const from = dates.isSame(first, last, { unit: 'month' }) ? 'D' : 'D MMM';
		return `${dates.format(first, from)} \u2013 ${dates.format(last, 'D MMM')}`;
	}

	/**
	 * Reads the scroll position and width of the timeline container into the visible window
	 *
	 * @method updateVisibleRange
	 * @private
	 */
	updateVisibleRange() {
		this.visibleFrameId = null;
		if (this.isDestroying || this.isDestroyed || !this.timelineContainerElement) {
			return;
		}
		const start = this.timelineContainerElement.scrollLeft;
		const width = Math.max(0, this.timelineViewportWidth);
		if (start !== this.visibleStart) {
			this.visibleStart = start;
		}
		if (width !== this.visibleWidth) {
			this.visibleWidth = width;
		}
	}

	/**
	 * Scroll listener of the timeline container: one visible-range update per animation frame
	 *
	 * @method handleTimelineScroll
	 * @private
	 */
	@action
	handleTimelineScroll() {
		if (this.visibleFrameId === null) {
			this.visibleFrameId = requestAnimationFrame(() => this.updateVisibleRange());
		}
	}

	/**
	 * Saves the scale and both toggles under the one documented key. On phones the scale is the
	 * desktop's saved one, so a phone's Days choice never replaces it.
	 *
	 * @method savePreferences
	 * @private
	 */
	savePreferences() {
		if (this.viewport.isPhone) {
			savePhonePreferences({
				links: this.linkTypes,
				otherProjects: this.showOtherProjects,
				labels: this.showLabels,
				weekends: this.showWeekends
			});
			return;
		}
		saveToolbarPreferences({
			scale: this.timeScale,
			links: this.linkTypes,
			otherProjects: this.showOtherProjects,
			weekends: this.showWeekends
		});
	}

	/**
	 * Sets the link types from the Links field's chips
	 *
	 * @method selectLinkTypes
	 * @param {Array} selected the chosen options
	 * @public
	 */
	@action
	selectLinkTypes(selected) {
		let types = (selected || []).map((option) => option.value);
		this.linkTypes = LINK_TYPES.filter((type) => types.includes(type));
		this.savePreferences();
	}

	/**
	 * Adds or removes one link type from the Links filter
	 *
	 * @method toggleLinkType
	 * @param {String} type `blocks`, `splits` or `relates`
	 * @public
	 */
	@action
	toggleLinkType(type) {
		this.linkTypes = LINK_TYPES.filter((option) => (option === type ? !this.linkTypes.includes(type) : this.linkTypes.includes(option)));
		this.savePreferences();
	}

	/**
	 * Shows or hides the issues of other projects
	 *
	 * @method toggleOtherProjects
	 * @public
	 */
	@action
	toggleOtherProjects() {
		this.showOtherProjects = !this.showOtherProjects;
		this.savePreferences();
	}

	/**
	 * Shows or hides the bar labels (phones' options menu)
	 *
	 * @method toggleLabels
	 * @public
	 */
	@action
	toggleLabels() {
		this.showLabels = !this.showLabels;
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
		const todayLeft = (this.todayOffset ?? this.timeAxis.dayOffset(dates.now()) ?? 0) * this.dayWidth;
		const left = Math.max(0, todayLeft - (this.timelineViewportWidth / 2));
		this.timelineContainerElement.scrollTo({ left, behavior: 'auto' });
		this.updateVisibleRange();
	}

	/**
	 * Where an issue's bar starts on the axis, in day columns: its planned start, else its start date
	 *
	 * @method barStartOffset
	 * @param {Object} issue
	 * @return {Number}
	 * @private
	 */
	barStartOffset(issue) {
		const planned = this.args.schedule?.get(String(issue.id))?.plannedStart;
		const offset = planned ? this.timeAxis.momentOffset(planned) : this.timeAxis.dayOffset(issue.startDate);
		return toFiniteNumber(offset);
	}

	/**
	 * Computed property that generates the date range for the timeline: its day columns (working days only in Hours)
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
		const range = generateDateRange(
			this.args.timelineStart,
			this.args.timelineEnd
		);
		if (!this.isHours) {
			return range;
		}
		const columns = new Set(this.timeAxis.columns);
		return range.filter((day) => columns.has(day.date));
	}

	/**
	 * Where now lies on the axis, in (fractional) day columns: 09:00 is the left edge of today's column and 18:00
	 * its right edge (on a weekend in Hours, the next working day's left edge). Null when now is outside the timeline.
	 * The today line positions itself from this with the root `--gantt-day-width`.
	 *
	 * @property todayOffset
	 * @type Number|null
	 * @for GanttChartComponent
	 * @public
	 */
	get todayOffset() {
		const offset = this.timeAxis.momentOffset(dates.now());
		return offset === null || offset < 0 || offset > this.totalDays ? null : offset;
	}

	/**
	 * The today line's position as a CSS custom property in day columns. Empty when today is outside the timeline.
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
		return this.timeAxis.columns.length;
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
			`--gantt-hours-per-day: ${toFiniteNumber(WORK_HOURS_PER_DAY)}; ` +
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
		// Hours: one working day of hour columns; the others: one week of day columns
		return this.isHours ? this.gridDayWidth : this.gridDayWidth * 7;
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
		if (!this.args.timelineStart || this.isHours) {
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
		if (this.isHours) {
			// the hour lines inside a day; the dashed day separator is gridDaySeparatorPath
			const hourWidth = this.gridDayWidth / WORK_HOURS_PER_DAY;
			for (let hour = 1; hour < WORK_HOURS_PER_DAY; hour++) {
				lines.push(`M ${hour * hourWidth} 0 V ${this.rowHeight}`);
			}
			return lines.join(' ');
		}
		for (let day = 1; day <= 7; day++) {
			lines.push(`M ${day * this.gridDayWidth} 0 V ${this.rowHeight}`);
		}
		return lines.join(' ');
	}

	/**
	 * The dashed line between two working days in Hours (at the pattern's left edge); empty in the other scales
	 *
	 * @property gridDaySeparatorPath
	 * @type String
	 * @for GanttChartComponent
	 * @public
	 */
	get gridDaySeparatorPath() {
		return this.isHours ? `M 0 0 V ${this.rowHeight}` : '';
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
					label: dates.format(day.date, 'D'),
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
			} else if (this.viewport.isPhone) {
				this.scrollToToday();
			}
			this.updateVisibleRange();
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
	 * The lines to draw: the project's issue links whose two issues both have bars on the chart. Each carries its
	 * type, its Issuelink and, for `blocks`, whether it is a schedule conflict. Parent/child draws no line.
	 *
	 * @property dependencies
	 * @type Array
	 * @for GanttChartComponent
	 * @public
	 */
	get dependencies() {
		let lookup = this.args.links;
		if (!lookup) {
			return [];
		}
		// Read the selection so the list is recomputed, and the layer redraws, when it changes (relates links show for it)
		let selectedId = this.args.selectedIssue?.id;
		let issueMap = this.issueMap;
		let ghostMap = this.ghostMap;
		let deps = [];
		// phones with the option off: every type, but only the selected issue's links
		let selectedOnly = this.showSelectedLinksOnly;

		lookup.links.forEach((link) => {
			let fromId = link.belongsTo('sourceIssue').id();
			let toId = link.belongsTo('targetIssue').id();
			let from = issueMap[fromId] || ghostMap[fromId];
			let to = issueMap[toId];

			if (!from || !to) {
				return;
			}
			if (selectedOnly) {
				let touches = selectedId !== undefined && selectedId !== null && (String(fromId) === String(selectedId) || String(toId) === String(selectedId));
				if (!touches) {
					return;
				}
			} else if (!this.linkTypes.includes(link.type)) {
				return;
			}
			deps.push({
				fromIssueId: fromId,
				toIssueId: toId,
				type: link.type,
				selectedId,
				link,
				conflict: link.type === 'blocks' && isConflict(from, to, (issue) => lookup.isOpen(issue), this.args.schedule)
			});
		});

		return deps;
	}

	/**
	 * The blockers from other projects of the workspace to show as ghost rows: the issues of another project that
	 * block a shown issue (a `blocks` link whose source is not in this project). Empty while Other projects is off.
	 *
	 * @property ghostIssues
	 * @type Issue[]
	 * @for GanttChartComponent
	 * @public
	 */
	get ghostIssues() {
		let lookup = this.args.links;
		if (!lookup || !this.showOtherProjects) {
			return [];
		}
		let issueMap = this.issueMap;
		let found = new Map();
		let projectId = String(lookup.projectId);

		lookup.links.forEach((link) => {
			if (link.type !== 'blocks' || !issueMap[link.belongsTo('targetIssue').id()]) {
				return;
			}
			let source = link.belongsTo('sourceIssue').value?.();
			if (source && String(source.projectId) !== projectId && !issueMap[source.id]) {
				found.set(String(source.id), source);
			}
		});
		return [...found.values()];
	}

	/**
	 * The ghost issues by id.
	 *
	 * @property ghostMap
	 * @type Object
	 * @for GanttChartComponent
	 * @private
	 */
	get ghostMap() {
		let map = Object.create(null);
		this.ghostIssues.forEach((issue) => {
			map[issue.id] = issue;
		});
		return map;
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
	 * Action to handle a bar click: selects the issue (on phones the selection bar then offers the edit sheet); the list scrolls to and marks it through `@activeId`
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
	 * Whether the phone selection bar shows: a phone with an issue selected
	 *
	 * @property showSelectionBar
	 * @type Boolean
	 * @public
	 */
	get showSelectionBar() {
		return this.viewport.isPhone && Boolean(this.args.selectedIssue);
	}

	/**
	 * Selection bar: opens the edit sheet for the selected issue
	 *
	 * @method editSelected
	 * @public
	 */
	@action
	editSelected() {
		this.args.onEditIssue?.(this.args.selectedIssue);
	}

	/**
	 * Selection bar: opens Link issue for the selected issue
	 *
	 * @method linkSelected
	 * @public
	 */
	@action
	linkSelected() {
		this.args.onLinkIssue?.(this.args.selectedIssue);
	}

	/**
	 * Selection bar: opens the quick view of the selected issue
	 *
	 * @method detailsSelected
	 * @public
	 */
	@action
	detailsSelected() {
		this.handleOpenIssuePanel(this.args.selectedIssue);
	}

	/**
	 * Clears the selection (the bar's close button)
	 *
	 * @method deselect
	 * @public
	 */
	@action
	deselect() {
		this.args.onIssueClick?.(null);
	}

	/**
	 * A tap on empty space of the timeline or the grid clears the selection on phones; taps on bars and rows
	 * (buttons, links) keep it
	 *
	 * @method handleEmptyTap
	 * @param {Event} event
	 * @public
	 */
	@action
	handleEmptyTap(event) {
		if (!this.viewport.isPhone || !this.args.selectedIssue) {
			return;
		}
		if (event.target.closest?.('[data-test-gantt-bar], button, a, .gantt-grid-row, .gantt-bar')) {
			return;
		}
		this.deselect();
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
	 * Selects and scrolls to the issue the page asked to show (an issue opened from the URL).
	 *
	 * @method showScrollTarget
	 * @public
	 */
	@action
	showScrollTarget() {
		if (this.args.scrollTarget) {
			this.handleListSelect(this.args.scrollTarget);
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
		const barLeft = this.barStartOffset(issue) * this.dayWidth;

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
		// Every milestone starts expanded
		return true;
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
		element.addEventListener('scroll', this.handleTimelineScroll, { passive: true });
		element.addEventListener('click', this.handleEmptyTap);
		// the container has its size after layout; phones then open with today in view
		requestAnimationFrame(() => {
			if (this.isDestroying || this.isDestroyed || this.timelineContainerElement !== element) {
				return;
			}
			if (this.args.scrollTarget) {
				this.showScrollTarget();
			} else if (this.viewport.isPhone) {
				this.scrollToToday();
			} else {
				this.scrollToFirstIssue();
			}
			this.updateVisibleRange();
		});
	}

	/**
	 * The first issue with a start date in grid order (milestone by milestone, as filtered), or null.
	 *
	 * @property firstDatedIssue
	 * @type Prometheus.Models.Issue
	 * @for GanttChartComponent
	 * @public
	 */
	get firstDatedIssue() {
		return this.allIssues.find((issue) => issue?.startDate) || null;
	}

	/**
	 * Identifies the first dated issue; when it changes (a search changed the shown issues) the timeline scrolls to it.
	 *
	 * @property firstIssueKey
	 * @type String
	 * @for GanttChartComponent
	 * @public
	 */
	get firstIssueKey() {
		return this.firstDatedIssue?.id ?? '';
	}

	/**
	 * Scrolls the timeline sideways so the first dated issue starts near the left edge (rows stay at the top).
	 * Phones open around today and an issue asked for by the URL wins, so both skip this.
	 *
	 * @method scrollToFirstIssue
	 * @public
	 */
	@action
	scrollToFirstIssue() {
		if (this.viewport.isPhone || this.args.scrollTarget || !this.timelineContainerElement) {
			return;
		}
		const issue = this.firstDatedIssue;
		if (!issue) {
			return;
		}
		const barLeft = this.barStartOffset(issue) * this.dayWidth;
		const margin = this.timeScale === 'days' ? this.dayWidth : 4;
		this.timelineContainerElement.scrollTo({ left: Math.max(0, barLeft - margin), behavior: 'auto' });
	}

	/**
	 * Clear the stored timeline container reference when component is destroyed
	 *
	 * @method unregisterTimelineContainer
	 * @public
	 */
	@action unregisterTimelineContainer() {
		this.timelineContainerElement?.removeEventListener('scroll', this.handleTimelineScroll);
		this.timelineContainerElement?.removeEventListener('click', this.handleEmptyTap);
		if (this.visibleFrameId !== null) {
			cancelAnimationFrame(this.visibleFrameId);
			this.visibleFrameId = null;
		}
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
	 * Begin creating a dependency by pressing the mouse on a bar's link dot.
	 * Sets up the linking state, draws the preview line while the pointer moves,
	 * and cancels on a mouse-up away from a bar or on Escape.
	 *
	 * @method startDependencyLink
	 * @param {Object} issue The issue whose dot was pressed
	 * @param {String} anchor `start` or `end`: the dot that was pressed
	 * @param {MouseEvent} event
	 * @public
	 */
	@action startDependencyLink(issue, anchor, event) {
		if (!issue || !this.timelineBodyElement) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		// A second press while a link is pending starts over
		this.resetLinkingState();

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

		// The target bar completes the link on its own mouse-up, which reaches the bar
		// before it bubbles to the document; a mouse-up anywhere else cancels.
		document.addEventListener('mousemove', this.handleGlobalMouseMove);
		document.addEventListener('mouseup', this.handleGlobalMouseUp);
		document.addEventListener('keydown', this.handleGlobalKeyDown);
	}

	/**
	 * Complete the pending link on a mouse-up over any part of another bar.
	 * The pressed dot gives the direction: from the end dot the source issue comes
	 * first (predecessor); from the start dot the target issue comes first.
	 * Opens the link-type picker through `@onCreateDependency`.
	 *
	 * @method completeDependencyLink
	 * @param {Object} issue The issue of the bar the mouse was released on
	 * @param {MouseEvent} event
	 * @public
	 */
	@action completeDependencyLink(issue, event) {
		if (!this.linkingState || !issue) {
			return;
		}

		event.preventDefault();

		let { sourceIssue, sourceAnchor } = this.linkingState;
		this.resetLinkingState();

		// Released on the bar it started from: nothing to link
		if (sourceIssue.id === issue.id || !this.args.onCreateDependency) {
			return;
		}

		let [predecessor, successor] =
			sourceAnchor === 'start' ? [issue, sourceIssue] : [sourceIssue, issue];

		// A keyboard-made click has no pointer position: open the picker at the dot instead
		let point = { x: event.clientX, y: event.clientY };
		if (event.type === 'click' && event.detail === 0 && event.target?.getBoundingClientRect) {
			let rect = event.target.getBoundingClientRect();
			point = { x: rect.right, y: rect.bottom };
		}

		this.args.onCreateDependency(predecessor, successor, point);
	}

	/**
	 * Cancel a pending link when the mouse is released away from a bar
	 *
	 * @method handleGlobalMouseUp
	 * @public
	 */
	@action handleGlobalMouseUp() {
		this.resetLinkingState();
	}

	/**
	 * Cancel a pending link on Escape
	 *
	 * @method handleGlobalKeyDown
	 * @param {KeyboardEvent} event
	 * @public
	 */
	@action handleGlobalKeyDown(event) {
		if (event.key === 'Escape' && this.linkingState) {
			event.preventDefault();
			this.resetLinkingState();
		}
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
		document.removeEventListener('mouseup', this.handleGlobalMouseUp);
		document.removeEventListener('keydown', this.handleGlobalKeyDown);
		if (this.linkingState) {
			this.linkingState = null;
		}
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

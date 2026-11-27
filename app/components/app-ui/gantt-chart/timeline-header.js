/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import * as dates from 'prometheus/utils/date';
import { toFiniteNumber } from 'prometheus/utils/gantt-helpers';
import { WORK_DAY_START_HOUR, WORK_HOURS_PER_DAY } from 'prometheus/utils/gantt/working-time';
import { HOURS_SCALE } from 'prometheus/utils/gantt/time-axis';

/**
 * Timeline header renderer for months/weeks/days/hours
 *
 * @class TimelineHeaderComponent
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class TimelineHeaderComponent extends Component {
	/**
	 * Get today's date in YYYY-MM-DD format
	 *
	 * @property today
	 * @type String
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get today() {
		return dates.format(dates.now(), 'YYYY-MM-DD');
	}

	/**
	 * Get the start of the current week (Monday)
	 *
	 * @property currentWeekStart
	 * @type Date
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get currentWeekStart() {
		return dates.startOf(dates.now(), 'isoWeek');
	}

	/**
	 * Get the end of the current week (Sunday)
	 *
	 * @property currentWeekEnd
	 * @type Date
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get currentWeekEnd() {
		return dates.endOf(dates.now(), 'isoWeek');
	}

	/**
	 * Get the dateRange with current day and week flags added
	 *
	 * @property dateRangeWithFlags
	 * @type Array
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get dateRangeWithFlags() {
		if (!this.args.dateRange || this.args.dateRange.length === 0) {
			return [];
		}

		const today = this.today;
		const weekStart = this.currentWeekStart;
		const weekEnd = this.currentWeekEnd;
		
		// Single pass: map dates and track first/last current week indices
		let firstCurrentWeekIndex = -1;
		let lastCurrentWeekIndex = -1;
		
		const datesWithFlags = this.args.dateRange.map((date, index) => {
			const isCurrentWeek = dates.isSameOrAfter(date.date, weekStart, { unit: 'day' }) &&
			                      dates.isSameOrBefore(date.date, weekEnd, { unit: 'day' });
			
			// Track first and last current week indices
			if (isCurrentWeek) {
				if (firstCurrentWeekIndex === -1) {
					firstCurrentWeekIndex = index;
				}
				lastCurrentWeekIndex = index;
			}
			
			return {
				...date,
				weekdayInitial: dates.format(date.date, 'dd').charAt(0),
				dayNumber: dates.part(date.date, 'date'),
				isToday: date.date === today,
				isCurrentWeek,
				isCurrentWeekFirst: false, // Will be set correctly after we know all indices
				isCurrentWeekLast: false
			};
		});

		// Set first and last flags in a single pass
		if (firstCurrentWeekIndex !== -1) {
			datesWithFlags[firstCurrentWeekIndex].isCurrentWeekFirst = true;
			datesWithFlags[lastCurrentWeekIndex].isCurrentWeekLast = true;
		}

		return datesWithFlags;
	}
	/**
	 * Whether the Days scale is shown
	 *
	 * @property isDays
	 * @type Boolean
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get isDays() {
		return !['weeks', 'months', HOURS_SCALE].includes(this.args.timeScale);
	}

	/**
	 * Whether the Hours scale is shown
	 *
	 * @property isHours
	 * @type Boolean
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get isHours() {
		return this.args.timeScale === HOURS_SCALE;
	}

	/**
	 * The hour labels of one working day ("09" to "17"), one per hour column
	 *
	 * @property hourLabels
	 * @type String[]
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get hourLabels() {
		return Array.from({ length: WORK_HOURS_PER_DAY }, (_, index) => String(WORK_DAY_START_HOUR + index).padStart(2, '0'));
	}

	/**
	 * The bottom row in Hours: each working day's hour columns, `{ date, label, isDayStart }`
	 *
	 * @property hourCells
	 * @type Array
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get hourCells() {
		if (!this.isHours) {
			return [];
		}
		const labels = this.hourLabels;
		return (this.args.dateRange || []).flatMap((day) =>
			labels.map((label, index) => ({ date: day.date, label, isDayStart: index === 0 }))
		);
	}

	/**
	 * Whether the Weeks scale is shown
	 *
	 * @property isWeeks
	 * @type Boolean
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get isWeeks() {
		return this.args.timeScale === 'weeks';
	}

	/**
	 * The top row: the year in Months, the month and year in Days and Weeks
	 *
	 * @property topGroups
	 * @type Array
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get topGroups() {
		if (this.isHours) {
			// one working day per cell, such as "Mon 30 Nov"
			return (this.args.dateRange || []).map((day) => ({
				days: 1,
				date: day.date,
				label: dates.format(day.date, 'ddd D MMM')
			}));
		}
		if (this.args.timeScale === 'months') {
			return (this.args.yearGroups || []).map((group) => ({ ...group, label: group.year }));
		}
		const range = this.args.dateRange || [];
		let offset = 0;
		return (this.args.monthGroups || []).map((group) => {
			const first = range[offset];
			offset += group.days;
			return {
				...group,
				label: first ? dates.format(first.date, 'MMMM YYYY') : `${group.month} ${group.year}`
			};
		});
	}

	/**
	 * Cell class of the top row
	 *
	 * @property topCellClass
	 * @type String
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get topCellClass() {
		if (this.isHours) {
			return 'hours-day-cell';
		}
		return this.args.timeScale === 'months' ? 'year-cell' : 'month-cell';
	}

	/**
	 * The span's width in days as a CSS custom property; the SCSS multiplies it by `--gantt-day-width`,
	 * so a scale change does not touch the span. Only a number goes into the string.
	 *
	 * @method spanStyle
	 * @param {Object} span a year, month or week group with `days`
	 * @return {SafeString}
	 * @public
	 */
	@action
	spanStyle(span) {
		return htmlSafe(`--span-days: ${toFiniteNumber(span?.days)}`);
	}
}

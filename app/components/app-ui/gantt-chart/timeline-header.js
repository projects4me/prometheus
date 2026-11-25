/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import * as dates from 'prometheus/utils/date';
import { toFiniteNumber } from 'prometheus/utils/gantt-helpers';

/**
 * Timeline header renderer for months/weeks/days
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
	 * Check if the year row should be shown
	 *
	 * @property showYearRow
	 * @type Boolean
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get showYearRow() {
		return (
			this.args.timeScale === 'weeks' &&
			(this.args.yearGroups?.length || 0) > 0
		);
	}

	/**
	 * Check if the week row should be shown
	 *
	 * @property showWeekRow
	 * @type Boolean
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get showWeekRow() {
		return (
			this.args.timeScale === 'weeks' &&
			(this.args.weekGroups?.length || 0) > 0
		);
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

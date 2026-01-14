/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

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
		return moment().format('YYYY-MM-DD');
	}

	/**
	 * Get the start of the current week (Monday)
	 *
	 * @property currentWeekStart
	 * @type moment
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get currentWeekStart() {
		return moment().startOf('isoWeek');
	}

	/**
	 * Get the end of the current week (Sunday)
	 *
	 * @property currentWeekEnd
	 * @type moment
	 * @for TimelineHeaderComponent
	 * @public
	 */
	get currentWeekEnd() {
		return moment().endOf('isoWeek');
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
			const dateMoment = moment(date.date);
			const isCurrentWeek = dateMoment.isSameOrAfter(weekStart, 'day') && 
			                      dateMoment.isSameOrBefore(weekEnd, 'day');
			
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
	 * Apply the span style to the element
	 *
	 * @property applySpanStyle
	 * @type Function
	 * @for TimelineHeaderComponent
	 * @public
	 */
	@action
	applySpanStyle(span, element) {
		if (element && span) {
			const width = span.days * this.args.dayWidth;
			element.style.width = `${width}px`;
			element.style.minWidth = `${width}px`;
		}
	}

	/**
	 * Apply the day cell style to the element
	 *
	 * @property applyDayCellStyle
	 * @type Function
	 * @for TimelineHeaderComponent
	 * @public
	 */
	@action
	applyDayCellStyle(element) {
		if (element && this.args.dayWidth) {
			element.style.width = `${this.args.dayWidth}px`;
			element.style.minWidth = `${this.args.dayWidth}px`;
		}
	}
}

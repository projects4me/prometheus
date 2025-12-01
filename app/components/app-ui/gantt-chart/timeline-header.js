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

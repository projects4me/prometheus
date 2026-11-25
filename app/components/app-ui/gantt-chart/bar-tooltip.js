/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import DateUtils from 'prometheus/utils/date';

/**
 * The content of the shared Gantt bar tooltip: the hovered or focused issue's
 * subject link, estimated and spent time, and who modified it and when.
 * The chart renders one of these and the bars point it at their issue.
 *
 * @class BarTooltip
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Glimmer.Component
 */
export default class BarTooltipComponent extends Component {
	/**
	 * @property intl
	 * @type {Prometheus.Services.intl}
	 */
	@service intl;

	/**
	 * The issue's estimated time, formatted.
	 *
	 * @property estimated
	 * @type String
	 */
	get estimated() {
		return this.format('estimated');
	}

	/**
	 * The issue's spent time, formatted.
	 *
	 * @property spent
	 * @type String
	 */
	get spent() {
		return this.format('spent');
	}

	/**
	 * Sum the time logs of a context and format them as hours and minutes.
	 *
	 * @method format
	 * @param {String} context 'spent' or 'estimated'
	 * @returns {String} The formatted time
	 * @private
	 */
	format(context) {
		const timelogs = this.args.issue?.[context];
		let totalHours = 0;
		let totalMinutes = 0;
		if (timelogs && timelogs.length > 0) {
			timelogs.forEach((timelog) => {
				// Convert days to hours (8 hours per day)
				const daysToHours = (timelog.days || 0) * 8;
				totalHours += parseInt(timelog.hours || 0, 10) + parseInt(daysToHours, 10);
				totalMinutes += parseInt(timelog.minutes || 0, 10);
			});
		}
		const normalized = DateUtils.normalizeMinutes(totalMinutes);
		return `${totalHours + normalized.hours} ${this.intl.t('global.time.hrs')} ${normalized.minutes} ${this.intl.t('global.time.min')}`;
	}
}

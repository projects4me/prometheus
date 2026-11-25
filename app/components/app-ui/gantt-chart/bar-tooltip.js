/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

/**
 * The content of the shared Gantt bar tooltip: the hovered or focused issue's
 * subject link, estimated and spent time (`@timeTotals`, summed by the controller), and who modified it and when.
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
	 * Format the issue's logged minutes of a kind (from `@timeTotals`) as hours and minutes.
	 *
	 * @method format
	 * @param {String} kind 'spent' or 'estimated'
	 * @returns {String} The formatted time
	 * @private
	 */
	format(kind) {
		const total = this.args.issue ? this.args.timeTotals?.get(this.args.issue.id) : null;
		const minutes = total?.[kind] ?? 0;
		return `${Math.floor(minutes / 60)} ${this.intl.t('global.time.hrs')} ${minutes % 60} ${this.intl.t('global.time.min')}`;
	}
}

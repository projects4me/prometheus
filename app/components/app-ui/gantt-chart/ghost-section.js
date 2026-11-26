/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { hasValidDates, getDaysBetween, getPositionInDays, toFiniteNumber } from 'prometheus/utils/gantt-helpers';

/**
 * The "Other projects in this workspace" section of the Gantt: one read-only ghost row per issue of another project
 * that blocks a shown issue. It renders the grid cells (`@part="grid"`) or the timeline rows, level with each other.
 * A ghost bar registers like any bar so the blocks lines connect to it, but it has no drag, resize, link dot or eye.
 *
 * @class GhostSection
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Component
 */
export default class GhostSectionComponent extends Component {
	/**
	 * The rows to render: the issue, its code (PROJECTCODE-number) and its bar position, when it has dates.
	 *
	 * @property rows
	 * @type Array
	 * @for GhostSection
	 * @public
	 */
	get rows() {
		return (this.args.issues || []).map((issue) => {
			let dated = hasValidDates(issue);
			return {
				issue,
				code: `${String(issue.projectShortcode || '').toUpperCase()}-${issue.issueNumber}`,
				shortcode: String(issue.projectShortcode || '').toLowerCase(),
				hasDates: dated,
				barStyle: dated
					? htmlSafe(
							`--bar-start: ${toFiniteNumber(getPositionInDays(this.args.timelineStart, issue.startDate))}; ` +
								`--bar-days: ${Math.max(1, getDaysBetween(issue.startDate, issue.endDate) + 1)}`
						)
					: null
			};
		});
	}
}

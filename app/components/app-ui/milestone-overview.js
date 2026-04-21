/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import {
	unwrapOverviewPayload,
	aggregateTimeSegment,
} from 'prometheus/utils/milestone-overview-api';

/**
 * Presentational strip for milestone overview metrics (open/closed counts, progress bar,
 * spent vs estimated time). Parents are responsible for calling the milestone overview API
 * and passing the result.
 *
 * **Arguments**
 * - `@payload` — Raw JSON from `GET .../milestoneoverview/:id?includeHours=true` (possibly
 *   JSON:API-wrapped; unwrapping is handled by {@link unwrapOverviewPayload}). Parents decide when
 *   to render this component so data is present.
 * - `@milestone` — Optional milestone model used only for UI that the API does not provide:
 *   header icon, overdue styling from `endDate`, and start/end date labels. Omit for metrics-only layout.
 * - `@compact` — When true, applies tighter typography for narrow contexts (e.g. dashboard widget table).
 *
 * @class AppUiMilestoneOverviewComponent
 * @extends Component
 */
export default class AppUiMilestoneOverviewComponent extends Component {
	/**
	 * Normalized overview object for display, or `null` if payload is missing/invalid.
	 *
	 * @method overview
	 * @return {Object|null}
	 */
	get overview() {
		return unwrapOverviewPayload(this.args.payload);
	}

	/**
	 * Open and closed issue counts from the overview payload, or `null` if there is no usable overview.
	 *
	 * @method issueCountsFromOverview
	 * @return {{ openIssues: number, closedIssues: number }|null}
	 */
	get issueCountsFromOverview() {
		let overviewData = this.overview;
		if (!overviewData) {
			return null;
		}
		return {
			openIssues: Number(overviewData.openIssues) || 0,
			closedIssues: Number(overviewData.closedIssues) || 0,
		};
	}

	/**
	 * Progress percentage (0–100) from closed vs total issues in the overview payload.
	 *
	 * @method progressPercent
	 * @return {number}
	 */
	get progressPercent() {
		let counts = this.issueCountsFromOverview;
		if (!counts) {
			return 0;
		}
		let totalIssues = counts.openIssues + counts.closedIssues;
		if (totalIssues === 0) {
			return 0;
		}
		return Math.round((counts.closedIssues / totalIssues) * 100);
	}

	/**
	 * Total issues (open + closed) from the overview payload.
	 *
	 * @method totalIssues
	 * @return {number}
	 */
	get totalIssues() {
		let counts = this.issueCountsFromOverview;
		return counts ? counts.openIssues + counts.closedIssues : 0;
	}

	/**
	 * Spent time as `{ hours, minutes }` after normalizing days/hours/minutes from the payload.
	 *
	 * @method spentDisplay
	 * @return {{ hours: number, minutes: number }}
	 */
	get spentDisplay() {
		return aggregateTimeSegment(this.overview?.spent);
	}

	/**
	 * Estimated time as `{ hours, minutes }` after normalizing days/hours/minutes from the payload.
	 *
	 * @method estimatedDisplay
	 * @return {{ hours: number, minutes: number }}
	 */
	get estimatedDisplay() {
		return aggregateTimeSegment(this.overview?.estimated);
	}

	/**
	 * Font Awesome icon class for the milestone header icon from `@milestone` status and dates.
	 *
	 * @method milestoneIcon
	 * @return {string}
	 */
	get milestoneIcon() {
		return this._effectiveMilestoneStatus() === 'overdue'
			? 'fa fa-exclamation-triangle'
			: 'fa fa-bullseye';
	}

	/**
	 * Background color class for the milestone header icon (`bg-red` / `bg-yellow`).
	 *
	 * @method milestoneBgClass
	 * @return {string}
	 */
	get milestoneBgClass() {
		return this._effectiveMilestoneStatus() === 'overdue' ? 'bg-red' : 'bg-yellow';
	}

	/**
	 * True when `@milestone` is passed: show icon, date range, and progress strip beside the icon.
	 * Separate from `@compact`, which only tightens typography in narrow layouts.
	 *
	 * @method showCompactView
	 * @return {boolean}
	 */
	get showCompactView() {
		return Boolean(this.args.milestone);
	}

	/**
	 * Status used for icon and background: `planned` / `in_progress` milestones past `endDate` read as `overdue`.
	 * When there is no milestone, returns `null` (callers treat as non-overdue default).
	 *
	 * @method _effectiveMilestoneStatus
	 * @return {string|null}
	 * @private
	 */
	_effectiveMilestoneStatus() {
		let milestone = this.args.milestone;
		if (!milestone) {
			return null;
		}
		let workflowStatus = milestone.status;
		let isActiveSchedule =
			workflowStatus === 'in_progress' || workflowStatus === 'planned';
		if (isActiveSchedule && milestone.endDate && moment().isSameOrAfter(milestone.endDate)) {
			return 'overdue';
		}
		return workflowStatus;
	}
}

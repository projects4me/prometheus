/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import * as dates from 'prometheus/utils/date';
import { getIssueProgress } from 'prometheus/utils/gantt-progress';

const DAY_FORMAT = 'YYYY-MM-DD';

/** The shift buttons: days to move both dates, with their translation key. */
const SHIFTS = [
	{ days: -7, key: 'minusWeek' },
	{ days: -1, key: 'minusDay' },
	{ days: 1, key: 'plusDay' },
	{ days: 7, key: 'plusWeek' }
];

/**
 * The phone bottom sheet of the Gantt: edit an issue's start and end dates (typed, or both shifted by a day or a
 * week) and manage what it depends on. Dates are saved through `@onSaveDates(issue, start, end)` (the controller's
 * updateIssueDates, the call dragging uses); a blocker is removed at once through IssueRelations.unlink and the
 * "Add dependency" button opens Issue::LinkIssueModal preset to "is blocked by". Gaia's errors show in the sheet.
 *
 * @class GanttEditSheetComponent
 * @namespace Prometheus.Components.AppUi.GanttChart
 * @extends Glimmer.Component
 *
 * @example
 * <AppUi::GanttChart::EditSheet @issue={{this.editIssue}} @links={{this.links}} @onSaveDates={{this.updateIssueDates}}
 *   @onLinksChanged={{this.reloadLinks}} @onOpenIssue={{this.openIssuePage}} @onClose={{this.closeEditSheet}} />
 */
export default class GanttEditSheetComponent extends Component {
	@service issueRelations;
	@service intl;

	@tracked startDate = String(this.args.issue?.startDate ?? '').slice(0, 10);
	@tracked endDate = String(this.args.issue?.endDate ?? '').slice(0, 10);
	@tracked error = null;
	@tracked showLink = false;

	shifts = SHIFTS;

	/**
	 * Issue number label of an issue: `#12`, or `code-12` for an issue of another project.
	 *
	 * @method label
	 * @param {Issue} issue
	 * @return {String}
	 */
	label = (issue) => {
		let same = String(issue.projectId) === String(this.args.issue.projectId);
		return same ? `#${issue.issueNumber}` : `${String(issue.projectShortcode || '').toLowerCase()}-${issue.issueNumber}`;
	};

	/**
	 * @property progress
	 * @type Number|null
	 */
	get progress() {
		return getIssueProgress(this.args.issue, this.args.timeTotals?.get(this.args.issue.id));
	}

	/**
	 * The blocking links: `{ link, issue }` per blocker.
	 *
	 * @property blockers
	 * @type Object[]
	 */
	get blockers() {
		let lookup = this.args.links;
		return (lookup?.blockedBy(this.args.issue.id) ?? [])
			.map((link) => ({ link, issue: link.belongsTo('sourceIssue').value() }))
			.filter((row) => row.issue);
	}

	/**
	 * The issues this one blocks, read-only.
	 *
	 * @property blocked
	 * @type Issue[]
	 */
	get blocked() {
		return (this.args.links?.blocks(this.args.issue.id) ?? [])
			.map((link) => link.belongsTo('targetIssue').value())
			.filter(Boolean);
	}

	/**
	 * "4 days long" (both ends counted), or an empty string when a date is missing or the end is before the start.
	 *
	 * @property duration
	 * @type String
	 */
	get duration() {
		if (!this.startDate || !this.endDate) {
			return '';
		}
		let count = Math.round(dates.diff(this.endDate, this.startDate, 'days')) + 1;
		return Number.isFinite(count) && count > 0 ? this.intl.t('views.app.gantt.editSheet.duration', { count }) : '';
	}

	/**
	 * Save needs both dates, the end not before the start.
	 *
	 * @property cannotSave
	 * @type Boolean
	 */
	get cannotSave() {
		return !this.duration;
	}

	@action
	setStart(value) {
		this.startDate = value;
	}

	@action
	setEnd(value) {
		this.endDate = value;
	}

	/**
	 * Moves both dates by `days`.
	 *
	 * @method shift
	 * @param {Number} days
	 */
	@action
	shift(days) {
		if (!this.startDate || !this.endDate) {
			return;
		}
		this.startDate = dates.format(dates.add(this.startDate, days, 'days'), DAY_FORMAT);
		this.endDate = dates.format(dates.add(this.endDate, days, 'days'), DAY_FORMAT);
	}

	/**
	 * Saves the dates; the modal stays open and shows Gaia's message when it refuses.
	 *
	 * @method save
	 * @return {Promise<Boolean>} true closes the sheet
	 */
	@action
	async save() {
		this.error = null;
		try {
			await this.args.onSaveDates(this.args.issue, this.startDate, this.endDate);
			return true;
		} catch (error) {
			if (!isDestroying(this) && !isDestroyed(this)) {
				this.error = this.message(error, 'views.app.gantt.issue.updateError');
				// the controller rolled the record back: show its dates again
				this.startDate = String(this.args.issue.startDate ?? '').slice(0, 10);
				this.endDate = String(this.args.issue.endDate ?? '').slice(0, 10);
			}
			return false;
		}
	}

	/**
	 * Removes a blocker at once and updates the links lookup.
	 *
	 * @method remove
	 * @param {Issuelink} link
	 */
	@action
	async remove(link) {
		this.error = null;
		try {
			await this.issueRelations.unlink(this.args.issue, { link });
			if (isDestroying(this) || isDestroyed(this)) {
				return;
			}
			this.args.links?.remove(link);
		} catch (error) {
			if (!isDestroying(this) && !isDestroyed(this)) {
				this.error = this.message(error, 'views.app.gantt.dependency.deleteError');
			}
		}
	}

	@action
	openLink() {
		this.showLink = true;
	}

	@action
	closeLink() {
		this.showLink = false;
	}

	/**
	 * After Add dependency saved: ask the controller to reload the links lookup.
	 *
	 * @method linked
	 */
	@action
	linked() {
		this.args.onLinksChanged?.();
	}

	@action
	openIssue() {
		this.args.onOpenIssue?.(this.args.issue);
	}

	/**
	 * @method message
	 * @private
	 */
	message(error, fallbackKey) {
		return error?.errors?.[0]?.detail || error?.errors?.[0]?.title || this.intl.t(fallbackKey);
	}
}

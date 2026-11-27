/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { issueWindow } from 'prometheus/utils/gantt/schedule';
import { workDayEnd } from 'prometheus/utils/gantt/working-time';

/**
 * Whether a `blocks` link is a schedule conflict: the blocker is still open and the blocked issue is pushed past
 * its end date (18:00) because the blocker's planned end is after the blocked issue's window start. Same-day chains
 * that fit their window are not conflicts.
 *
 * @method isConflict
 * @param {Issue} blocker the source of the blocks link
 * @param {Issue} blocked the target of the blocks link
 * @param {Function} isOpen `(issue) => Boolean`, whether the issue is not in a done status
 * @param {Map} plan the chart's schedule (issue id → `{ plannedEnd, pushed }`)
 * @return {Boolean}
 */
export function isConflict(blocker, blocked, isOpen = () => true, plan = new Map()) {
	if (!blocker || !blocked || !isOpen(blocker) || !plan?.get(String(blocked.id))?.pushed) {
		return false;
	}
	let window = issueWindow(blocked);
	// a blocker off the chart (another project) has no plan: its end date at 18:00 stands in
	let blockerEnd = plan.get(String(blocker.id))?.plannedEnd ?? workDayEnd(blocker.endDate);
	return Boolean(window && blockerEnd && blockerEnd > window.start);
}

/**
 * The open blockers that push an issue past its end date, latest planned end first (from the `blocks` links that
 * target it).
 *
 * @method conflictingBlockers
 * @param {Issue} issue the blocked issue
 * @param {IssueLinkLookup} lookup the project's links
 * @param {Map} plan the chart's schedule
 * @return {Issue[]}
 */
export function conflictingBlockers(issue, lookup, plan = new Map()) {
	if (!issue || !lookup) {
		return [];
	}
	let endOf = (blocker) => plan?.get(String(blocker.id))?.plannedEnd ?? workDayEnd(blocker.endDate) ?? 0;
	return lookup.links
		.filter((link) => link.type === 'blocks' && String(link.belongsTo('targetIssue').id()) === String(issue.id))
		.map((link) => link.belongsTo('sourceIssue').value())
		.filter((blocker) => blocker && isConflict(blocker, issue, (item) => lookup.isOpen(item), plan))
		.sort((x, y) => endOf(y) - endOf(x));
}

/**
 * How to name a blocker in the flag: `#number` in the same project, the project code otherwise.
 *
 * @method blockerName
 * @param {Issue} blocker
 * @param {String|Number} projectId the project of the chart
 * @return {String}
 */
export function blockerName(blocker, projectId) {
	if (!blocker.projectShortcode || String(blocker.projectId) === String(projectId)) {
		return `#${blocker.issueNumber}`;
	}
	return String(blocker.projectShortcode).toUpperCase();
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The calendar day (YYYY-MM-DD) of a date value, or null when it has none.
 *
 * @method dayOf
 * @param {String|Date|null} value
 * @return {String|null}
 */
function dayOf(value) {
	if (!value) {
		return null;
	}
	if (value instanceof Date) {
		if (Number.isNaN(value.getTime())) {
			return null;
		}
		let month = String(value.getMonth() + 1).padStart(2, '0');
		let day = String(value.getDate()).padStart(2, '0');
		return `${value.getFullYear()}-${month}-${day}`;
	}
	let text = String(value).slice(0, 10);
	return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

/**
 * Whether a `blocks` link is a schedule conflict: the blocker is still open and the blocked issue starts on or
 * before the blocker's end date.
 *
 * @method isConflict
 * @param {Issue} blocker the source of the blocks link
 * @param {Issue} blocked the target of the blocks link
 * @param {Function} isOpen `(issue) => Boolean`, whether the issue is not in a done status
 * @return {Boolean}
 */
export function isConflict(blocker, blocked, isOpen = () => true) {
	if (!blocker || !blocked || !isOpen(blocker)) {
		return false;
	}
	let blockedStart = dayOf(blocked.startDate);
	let blockerEnd = dayOf(blocker.endDate);
	return Boolean(blockedStart && blockerEnd && blockedStart <= blockerEnd);
}

/**
 * The open blockers an issue starts before, latest-ending first (from the `blocks` links that target it).
 *
 * @method conflictingBlockers
 * @param {Issue} issue the blocked issue
 * @param {IssueLinkLookup} lookup the project's links
 * @return {Issue[]}
 */
export function conflictingBlockers(issue, lookup) {
	if (!issue || !lookup) {
		return [];
	}
	return lookup.links
		.filter((link) => link.type === 'blocks' && String(link.belongsTo('targetIssue').id()) === String(issue.id))
		.map((link) => link.belongsTo('sourceIssue').value())
		.filter((blocker) => blocker && isConflict(blocker, issue, (item) => lookup.isOpen(item)))
		.sort((a, b) => (dayOf(b.endDate) < dayOf(a.endDate) ? -1 : 1));
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

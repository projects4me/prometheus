/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

const ISSUE_RELATED_TYPES = ['issue', 'comment', 'timelog'];

/**
 * Returns the grouping key (`SHORTCODE-number`, lower case) of a notification,
 * or null when it does not belong to an issue.
 *
 * @method issueGroupKey
 * @param {Object} notification
 * @return {String|null}
 * @public
 */
export function issueGroupKey(notification) {
	const context = notification?.context;
	const relatedTo = context?.relatedTo?.toLowerCase();
	if (
		!ISSUE_RELATED_TYPES.includes(relatedTo) ||
		!context.projectShortcode ||
		!context.issueNumber
	) {
		return null;
	}
	return `${String(context.projectShortcode).toLowerCase()}-${context.issueNumber}`;
}

const time = (notification) => new Date(notification.dateCreated).getTime();

/**
 * Groups a flat notification list by issue.
 *
 * Issue, comment and timelog notifications of the same issue form one group
 * entry `{ isGroup: true, key, shortcode, issueNumber, notifications }`, all
 * others are standalone entries `{ isGroup: false, notification }`. Entries are
 * ordered by their newest notification, newest first, and so are the
 * notifications inside a group.
 *
 * @method groupByIssue
 * @param {Array} notifications Flat list of notifications
 * @return {Array} Entries in display order
 * @public
 */
export default function groupByIssue(notifications = []) {
	const groups = new Map();
	const entries = [];

	notifications.forEach((notification) => {
		const key = issueGroupKey(notification);
		if (!key) {
			entries.push({ isGroup: false, notification, newest: time(notification) });
			return;
		}
		if (!groups.has(key)) {
			const entry = {
				isGroup: true,
				key,
				shortcode: String(notification.context.projectShortcode).toUpperCase(),
				issueNumber: notification.context.issueNumber,
				notifications: []
			};
			groups.set(key, entry);
			entries.push(entry);
		}
		groups.get(key).notifications.push(notification);
	});

	entries.forEach((entry) => {
		if (entry.isGroup) {
			entry.notifications.sort((a, b) => time(b) - time(a));
			entry.newest = time(entry.notifications[0]);
		}
	});

	// Array.prototype.sort is stable, so equal timestamps keep the input order
	entries.sort((a, b) => b.newest - a.newest);
	return entries;
}

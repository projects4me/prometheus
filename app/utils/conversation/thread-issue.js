/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The rules for creating an issue from a discussion thread: which threads may have one created, the subject and
 * description the new issue starts with. Linking the thread to the saved issue is the create controller's job.
 *
 * @class ThreadIssue
 * @namespace Prometheus.Utils.Conversation
 */

/**
 * Whether an issue may be created from the thread: only a discussion that has no linked issue yet
 *
 * @method canCreateIssueFromThread
 * @param {Prometheus.Models.Conversationroom} room
 * @return {Boolean}
 */
export function canCreateIssueFromThread(room) {
	return Boolean(room) && room.roomType === 'discussion' && !linkedIssueId(room);
}

/**
 * The id of the thread's linked issue: its issueId field, or else the id of its issue relationship
 *
 * @method linkedIssueId
 * @param {Prometheus.Models.Conversationroom} room
 * @return {String|null}
 */
export function linkedIssueId(room) {
	if (room.issueId) {
		return room.issueId;
	}
	return typeof room.belongsTo === 'function' ? room.belongsTo('issue').id() : null;
}

/**
 * The path of the thread page in the app
 *
 * @method threadPath
 * @param {Prometheus.Models.Conversationroom} room
 * @param {String} shortcode The project short code
 * @return {String}
 */
export function threadPath(room, shortcode) {
	return `/app/project/${shortcode}/conversations/${room.id}`;
}

/**
 * The subject and description a new issue starts with: the thread's subject, and its description followed by a
 * markdown link back to the thread
 *
 * @method threadIssueDraft
 * @param {Prometheus.Models.Conversationroom} room
 * @param {String} shortcode The project short code
 * @param {String} linkLabel The text before the link, e.g. "Created from the thread"
 * @return {Object} { subject, description }
 */
export function threadIssueDraft(room, shortcode, linkLabel) {
	let link = `${linkLabel}: [${room.subject ?? ''}](${threadPath(room, shortcode)})`;
	let description = (room.description ?? '').trim();
	return {
		subject: room.subject ?? '',
		description: description ? `${description}\n\n${link}` : link
	};
}

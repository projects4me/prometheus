/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

export const AGREE_TEXT = 'I agree';
export const DISAGREE_TEXT = 'I disagree';

/**
 * The counts of a thread from its comments: all comments, and for vote rooms the "I agree" and "I disagree" ones
 *
 * @method tallyComments
 * @param {Array<{id: String, comment: String}>} comments
 * @returns {{commentCount: Number, agreeCount: Number, disagreeCount: Number}}
 */
export function tallyComments(comments) {
	let counts = { commentCount: 0, agreeCount: 0, disagreeCount: 0 };
	for (let comment of comments) {
		counts.commentCount++;
		if (comment.comment === AGREE_TEXT) {
			counts.agreeCount++;
		} else if (comment.comment === DISAGREE_TEXT) {
			counts.disagreeCount++;
		}
	}
	return counts;
}

/**
 * The count source: one query per thread for its comments with the minimal fields. This is the only place that
 * knows where the counts come from, so a later issue can swap it for one Gaia call per page.
 *
 * @method fetchThreadComments
 * @param {Object} store the Ember Data store
 * @param {String} roomId
 * @returns {Promise<Array<{id: String, comment: String}>>}
 */
export async function fetchThreadComments(store, roomId) {
	let records = await store.query('comment', {
		query: `Comment.relatedId : ${roomId}`,
		fields: 'Comment.id,Comment.createdUser,Comment.comment',
		limit: -1
	});
	return records.toArray().map((record) => ({ id: record.id, comment: record.comment }));
}

/**
 * The comment counts and vote tallies of the threads on the loaded list page. `load` fetches the counts of a
 * page of rooms in parallel and only the newest call writes; rows render without counts while they load.
 * Live comment events adjust a thread's counts through `addComment` and `removeComment`, which are idempotent.
 *
 * @class ThreadCounts
 * @namespace Prometheus.Utils.Conversation
 */
export default class ThreadCounts {
	/**
	 * The counts by room id; replaced on every change so templates update
	 *
	 * @property byRoom
	 * @type {Object}
	 */
	@tracked byRoom = {};

	/**
	 * The comments (id to text) behind each room's counts
	 *
	 * @property comments
	 * @type {Object}
	 * @private
	 */
	comments = {};

	token = 0;

	/**
	 * @constructor
	 * @param {Object} options
	 * @param {Function} options.fetch `(roomId) => Promise<Array<{id, comment}>>`
	 * @param {Object} [options.owner] no writes once it is destroying or destroyed
	 */
	constructor({ fetch, owner } = {}) {
		this.fetch = fetch;
		this.owner = owner;
	}

	get isOwnerGone() {
		return Boolean(this.owner?.isDestroying || this.owner?.isDestroyed);
	}

	/**
	 * Loads the counts of the rooms of a page; a result of an older call (an older page) is dropped
	 *
	 * @method load
	 * @param {Array<String>} roomIds
	 * @returns {Promise}
	 */
	async load(roomIds) {
		let token = ++this.token;
		this.comments = {};
		this.byRoom = {};
		await Promise.all(
			roomIds.map(async (roomId) => {
				let comments;
				try {
					comments = await this.fetch(roomId);
				} catch (error) {
					return;
				}
				if (token !== this.token || this.isOwnerGone) {
					return;
				}
				this.comments[roomId] = Object.fromEntries(comments.map((comment) => [comment.id, comment.comment]));
				this.publish(roomId);
			})
		);
	}

	/**
	 * The counts of a room, null while they load or when they failed
	 *
	 * @method countsFor
	 * @param {String} roomId
	 * @returns {Object|null}
	 */
	countsFor(roomId) {
		return this.byRoom[roomId] || null;
	}

	/**
	 * Counts a comment created live, once, on a room whose counts are loaded
	 *
	 * @method addComment
	 * @param {String} roomId
	 * @param {String} commentId
	 * @param {String} text
	 */
	addComment(roomId, commentId, text) {
		if (!this.comments[roomId] || commentId in this.comments[roomId]) {
			return;
		}
		this.comments[roomId][commentId] = text;
		this.publish(roomId);
	}

	/**
	 * Stops counting a comment deleted live; the room is found by the comment when the event does not name it
	 *
	 * @method removeComment
	 * @param {String} commentId
	 * @param {String} [roomId]
	 */
	removeComment(commentId, roomId) {
		let ids = roomId ? [roomId] : Object.keys(this.comments);
		for (let id of ids) {
			if (this.comments[id] && commentId in this.comments[id]) {
				delete this.comments[id][commentId];
				this.publish(id);
			}
		}
	}

	publish(roomId) {
		let texts = Object.entries(this.comments[roomId]).map(([id, comment]) => ({ id, comment }));
		this.byRoom = { ...this.byRoom, [roomId]: tallyComments(texts) };
	}
}

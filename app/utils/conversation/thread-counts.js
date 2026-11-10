/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

export const AGREE_TEXT = 'I agree';
export const DISAGREE_TEXT = 'I disagree';

/**
 * The comment counts and vote tallies of the threads on the loaded list page. `load` fetches the counts of the
 * whole page with one call and only the newest call writes; rows render without counts while they load.
 * Live comment events adjust a thread's counts through `addComment` and `removeComment`, each comment once.
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
	 * The comment ids already applied live, so an event delivered twice counts once
	 *
	 * @property applied
	 * @type {Set<String>}
	 * @private
	 */
	applied = new Set();

	token = 0;

	/**
	 * @constructor
	 * @param {Object} options
	 * @param {Function} options.fetch `(roomIds) => Promise<{[roomId]: {commentCount, agreeCount, disagreeCount}}>`
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
	 * Loads the counts of the rooms of a page with one call; a result of an older call (an older page) is dropped
	 *
	 * @method load
	 * @param {Array<String>} roomIds
	 * @returns {Promise}
	 */
	async load(roomIds) {
		let token = ++this.token;
		this.applied = new Set();
		this.byRoom = {};
		let counts;
		try {
			counts = await this.fetch(roomIds);
		} catch (error) {
			return;
		}
		if (token !== this.token || this.isOwnerGone) {
			return;
		}
		this.byRoom = counts;
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
		let key = `+${commentId}`;
		if (!this.byRoom[roomId] || this.applied.has(key)) {
			return;
		}
		this.applied.add(key);
		this.applied.delete(`-${commentId}`);
		this.adjust(roomId, text, 1);
	}

	/**
	 * Stops counting a comment deleted live, once. The event names the room; without it nothing can be adjusted.
	 *
	 * @method removeComment
	 * @param {String} commentId
	 * @param {String} [roomId]
	 * @param {String} [text]
	 */
	removeComment(commentId, roomId, text) {
		let key = `-${commentId}`;
		if (!roomId || !this.byRoom[roomId] || this.applied.has(key)) {
			return;
		}
		this.applied.add(key);
		this.applied.delete(`+${commentId}`);
		this.adjust(roomId, text, -1);
	}

	adjust(roomId, text, delta) {
		let counts = { ...this.byRoom[roomId] };
		counts.commentCount = Math.max(0, counts.commentCount + delta);
		if (text === AGREE_TEXT) {
			counts.agreeCount = Math.max(0, counts.agreeCount + delta);
		} else if (text === DISAGREE_TEXT) {
			counts.disagreeCount = Math.max(0, counts.disagreeCount + delta);
		}
		this.byRoom = { ...this.byRoom, [roomId]: counts };
	}
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The participants of a thread: its creator first, then the distinct authors of its activity, newest first.
 *
 * @method buildParticipants
 * @param {{id: String, name: String}} creator
 * @param {Array<{createdUser: String, createdUserName: String, date: String}>} activity comments or votes
 * @returns {Array<{id: String, name: String}>}
 */
export function buildParticipants(creator, activity = []) {
    let participants = [];
    let seen = new Set();
    let push = (id, name) => {
        if (!id || seen.has(id)) return;
        seen.add(id);
        participants.push({ id, name });
    };
    push(creator?.id, creator?.name);
    let newestFirst = [...activity].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')) || String(b.id).localeCompare(String(a.id)));
    for (let entry of newestFirst) {
        push(entry.createdUser, entry.createdUserName);
    }
    return participants;
}

/**
 * The comment authors of one discussion thread, from their own query with the minimal fields (not the paged
 * comments). Comments posted or pushed live are added once. Vote threads derive their participants from the
 * votes instead (see `buildParticipants`).
 *
 * @class ThreadParticipants
 * @namespace Prometheus.Utils.State
 */
export default class ThreadParticipants {
    /**
     * The comments, `{ id, createdUser, createdUserName, date }`, replaced on every change
     *
     * @property records
     * @type Array
     * @public
     */
    @tracked records = [];

    roomId = null;

    /**
     * @constructor
     * @param {Object} options
     * @param {Object} options.store The Ember Data store
     * @param {Object} options.owner Owner whose destruction stops pending loads from writing state
     */
    constructor({ store, owner } = {}) {
        this.store = store;
        this.owner = owner;
    }

    /**
     * Forgets the comments and loads the authors of the given thread
     *
     * @method open
     * @param {String} roomId
     * @returns {Promise}
     * @public
     */
    async open(roomId) {
        this.roomId = roomId ?? null;
        this.records = [];
        if (!this.roomId) return;
        try {
            let result = await this.store.query('comment', {
                query: `(Comment.relatedId : ${roomId}) AND (Comment.relatedTo : conversationrooms)`,
                fields: 'Comment.id,Comment.createdUser,Comment.createdUserName,Comment.dateCreated',
                limit: -1
            });
            if (this.isStale(roomId)) return;
            let loaded = result.toArray().map((comment) => ThreadParticipants.toEntry(comment));
            let known = new Set(loaded.map((entry) => entry.id));
            this.records = [...loaded, ...this.records.filter((entry) => !known.has(entry.id))];
        } catch (error) {
            Logger.error('ThreadParticipants::open - Error:', error);
        }
    }

    /**
     * Adds a comment (the user's own or a live one) of the open thread, once
     *
     * @method add
     * @param {Object} comment A comment record or the changes of a comment event, with its id
     * @public
     */
    add(comment) {
        if (!comment?.id || this.records.some((entry) => entry.id === comment.id)) return;
        this.records = [...this.records, ThreadParticipants.toEntry(comment)];
    }

    /**
     * Drops a deleted comment
     *
     * @method remove
     * @param {String} commentId
     * @public
     */
    remove(commentId) {
        this.records = this.records.filter((entry) => entry.id !== commentId);
    }

    /**
     * @method isStale
     * @param {String} roomId
     * @returns {Boolean}
     * @private
     */
    isStale(roomId) {
        return this.roomId !== roomId || Boolean(this.owner?.isDestroying || this.owner?.isDestroyed);
    }

    /**
     * @method toEntry
     * @param {Object} comment
     * @returns {Object}
     * @static
     */
    static toEntry(comment) {
        return {
            id: comment.id,
            createdUser: comment.createdUser,
            createdUserName: comment.createdUserName,
            date: comment.dateCreated
        };
    }
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { hasNextPage } from 'prometheus/utils/quick-list/page-window';

/**
 * Loads the comments of one thread with their own query, newest page first, and keeps the pages loaded so far.
 * Older pages are appended on demand; comments saved or pushed live are added without a reload.
 *
 * @class ThreadComments
 * @namespace Prometheus.Utils.State
 */
export default class ThreadComments {
    /**
     * The comments loaded so far, newest first
     *
     * @property records
     * @type Array
     * @private
     */
    @tracked records = [];

    /**
     * Where the next older page starts: the creation date of the oldest comment fetched so far and how many
     * fetched comments share that date. Paging by date instead of by page number keeps the pages aligned when
     * comments are added or deleted while the thread is open.
     *
     * @property cursor
     * @type {Object|null} { date, count }
     * @private
     */
    cursor = null;

    /**
     * Whether older comments may still be loaded
     *
     * @property hasOlder
     * @type Boolean
     * @public
     */
    @tracked hasOlder = false;

    /**
     * Whether a page is being loaded
     *
     * @property isLoading
     * @type Boolean
     * @public
     */
    @tracked isLoading = false;

    /**
     * Whether the last load failed
     *
     * @property failed
     * @type Boolean
     * @public
     */
    @tracked failed = false;

    /**
     * The thread whose comments are loaded
     *
     * @property roomId
     * @type String
     * @public
     */
    roomId = null;

    /**
     * @constructor
     * @param {Object} options
     * @param {Object} options.store The Ember Data store
     * @param {Number} options.pageSize Comments per page
     * @param {Object} options.owner Owner whose destruction stops pending loads from writing state
     */
    constructor({ store, pageSize = 10, owner } = {}) {
        this.store = store;
        this.pageSize = pageSize;
        this.owner = owner;
    }

    /**
     * The comments to show, oldest first, without deleted records
     *
     * @property items
     * @type Array
     * @public
     */
    get items() {
        return this.records
            .filter((comment) => !comment.isDeleted && !comment.isDestroyed && !comment.isDestroying)
            .reverse();
    }

    /**
     * Forgets the loaded comments and loads the newest page of the given thread
     *
     * @method open
     * @param {String} roomId
     * @returns {Promise}
     * @public
     */
    open(roomId) {
        this.roomId = roomId ?? null;
        this.records = [];
        this.cursor = null;
        this.hasOlder = false;
        this.failed = false;
        this.isLoading = false;
        return this.roomId ? this.loadOlder() : Promise.resolve();
    }

    /**
     * Loads the next (older) page; after a failure it retries the same page.
     *
     * The page starts at the cursor: comments created at or before the oldest fetched one (`<:` is "at or
     * before" in Gaia). The comments that share the cursor's date come back again, so the limit grows by their
     * number and the ones already loaded are dropped.
     *
     * @method loadOlder
     * @returns {Promise}
     * @public
     */
    async loadOlder() {
        let roomId = this.roomId;
        if (!roomId || this.isLoading) return;
        this.isLoading = true;
        this.failed = false;
        let cursor = this.cursor;
        let limit = this.pageSize + (cursor?.count ?? 0);
        let query = `(Comment.relatedId : ${roomId}) AND (Comment.relatedTo : conversationrooms)`;
        if (cursor) {
            query += ` AND (Comment.dateCreated <: ${cursor.date})`;
        }
        try {
            let result = await this.store.query('comment', {
                query: `(${query})`,
                // The id keeps the order of comments created in the same second the same in every page
                sort: 'Comment.dateCreated,Comment.id',
                order: 'DESC',
                limit: limit,
                page: 1
            });
            if (this.isStale(roomId)) return;
            let fetched = result.slice();
            this.records = [...this.records, ...fetched.filter((comment) => !this.records.includes(comment))];
            let oldest = fetched[fetched.length - 1];
            if (oldest?.dateCreated) {
                this.cursor = {
                    date: oldest.dateCreated,
                    count: fetched.filter((comment) => comment.dateCreated === oldest.dateCreated).length
                };
            }
            this.hasOlder = result.meta?.links ? hasNextPage(result.meta) : fetched.length >= limit;
        } catch (error) {
            Logger.error('ThreadComments::loadOlder - Error:', error);
            if (!this.isStale(roomId)) this.failed = true;
        } finally {
            if (!this.isStale(roomId)) this.isLoading = false;
        }
    }

    /**
     * Adds a comment of the open thread (a saved reply or a live event) as the newest one
     *
     * @method add
     * @param {Object} comment
     * @public
     */
    add(comment) {
        if (!comment || this.records.includes(comment)) return;
        this.records = [comment, ...this.records];
    }

    /**
     * Drops a comment from the loaded ones
     *
     * @method remove
     * @param {String} commentId
     * @public
     */
    remove(commentId) {
        this.records = this.records.filter((comment) => comment.id !== commentId);
    }

    /**
     * Whether a finished load no longer belongs to the open thread or its owner is gone
     *
     * @method isStale
     * @param {String} roomId
     * @returns {Boolean}
     * @private
     */
    isStale(roomId) {
        return this.roomId !== roomId || Boolean(this.owner?.isDestroying || this.owner?.isDestroyed);
    }
}

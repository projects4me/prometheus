/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { AGREE_TEXT, DISAGREE_TEXT } from 'prometheus/utils/conversation/thread-counts';

/**
 * The votes of one vote thread: all of the room's vote comments from their own query (minimal fields), so the
 * tallies do not depend on the pages of comments the thread page loads. Votes cast by the user or pushed live are
 * added without a reload, once. The tallies, the voter list and the result are all derived from the same votes.
 *
 * @class ThreadVotes
 * @namespace Prometheus.Utils.State
 */
export default class ThreadVotes {
    /**
     * The votes, `{ id, createdUser, createdUserName, text, date }`, replaced on every change
     *
     * @property records
     * @type Array
     * @public
     */
    @tracked records = [];

    /**
     * Whether the votes are being loaded
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
     * The thread whose votes are loaded
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
     * @param {Object} options.owner Owner whose destruction stops pending loads from writing state
     */
    constructor({ store, owner } = {}) {
        this.store = store;
        this.owner = owner;
    }

    /**
     * Forgets the votes and loads those of the given thread
     *
     * @method open
     * @param {String} roomId
     * @returns {Promise}
     * @public
     */
    async open(roomId) {
        this.roomId = roomId ?? null;
        this.records = [];
        this.failed = false;
        this.isLoading = false;
        if (!this.roomId) return;
        this.isLoading = true;
        try {
            let result = await this.store.query('comment', {
                query: `(Comment.relatedId : ${roomId}) AND (Comment.relatedTo : conversationrooms)`,
                fields: 'Comment.id,Comment.createdUser,Comment.createdUserName,Comment.comment,Comment.dateCreated',
                limit: -1
            });
            if (this.isStale(roomId)) return;
            // Votes cast while loading are kept
            let loaded = result.toArray().map((comment) => ThreadVotes.toVote(comment));
            let known = new Set(loaded.map((vote) => vote.id));
            this.records = [...loaded, ...this.records.filter((vote) => !known.has(vote.id))];
        } catch (error) {
            Logger.error('ThreadVotes::open - Error:', error);
            if (!this.isStale(roomId)) this.failed = true;
        } finally {
            if (!this.isStale(roomId)) this.isLoading = false;
        }
    }

    /**
     * Adds a vote (the user's own or a live one) of the open thread, once
     *
     * @method add
     * @param {Object} comment A comment record or the changes of a comment event, with its id
     * @public
     */
    add(comment) {
        if (!comment?.id || this.records.some((vote) => vote.id === comment.id)) return;
        let vote = ThreadVotes.toVote(comment);
        if (vote.text !== AGREE_TEXT && vote.text !== DISAGREE_TEXT) return;
        this.records = [...this.records, vote];
    }

    /**
     * Drops a deleted vote
     *
     * @method remove
     * @param {String} commentId
     * @public
     */
    remove(commentId) {
        this.records = this.records.filter((vote) => vote.id !== commentId);
    }

    /**
     * The votes that agree or disagree (other comments of the room are not votes)
     *
     * @property votes
     * @type Array
     * @public
     */
    get votes() {
        return this.records.filter((vote) => vote.text === AGREE_TEXT || vote.text === DISAGREE_TEXT);
    }

    /**
     * The votes newest first
     *
     * @property newestFirst
     * @type Array
     * @public
     */
    get newestFirst() {
        return [...this.votes].sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.id).localeCompare(String(a.id)));
    }

    /**
     * @property agreeCount
     * @type Number
     * @public
     */
    get agreeCount() {
        return this.votes.filter((vote) => vote.text === AGREE_TEXT).length;
    }

    /**
     * @property disagreeCount
     * @type Number
     * @public
     */
    get disagreeCount() {
        return this.votes.filter((vote) => vote.text === DISAGREE_TEXT).length;
    }

    /**
     * @property total
     * @type Number
     * @public
     */
    get total() {
        return this.votes.length;
    }

    /**
     * The share of agreeing votes in percent, 0 without votes
     *
     * @property agreePercent
     * @type Number
     * @public
     */
    get agreePercent() {
        return this.total ? Math.round((this.agreeCount / this.total) * 100) : 0;
    }

    /**
     * The share of disagreeing votes in percent, 0 without votes
     *
     * @property disagreePercent
     * @type Number
     * @public
     */
    get disagreePercent() {
        return this.total ? Math.round((this.disagreeCount / this.total) * 100) : 0;
    }

    /**
     * The way the vote leans: `agree`, `disagree`, `tied` or `none` (no votes yet)
     *
     * @property leaning
     * @type String
     * @public
     */
    get leaning() {
        if (!this.total) return 'none';
        if (this.agreeCount === this.disagreeCount) return 'tied';
        return this.agreeCount > this.disagreeCount ? 'agree' : 'disagree';
    }

    /**
     * The votes of the leading side, 0 when tied or without votes
     *
     * @property leadingCount
     * @type Number
     * @public
     */
    get leadingCount() {
        return Math.max(this.agreeCount, this.disagreeCount);
    }

    /**
     * The text of the vote of a user (`I agree` / `I disagree`), null when the user has not voted
     *
     * @method voteOf
     * @param {String} userId
     * @returns {String|null}
     * @public
     */
    voteOf(userId) {
        return this.votes.find((vote) => vote.createdUser === userId)?.text ?? null;
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

    /**
     * The minimal vote of a comment record or event changes
     *
     * @method toVote
     * @param {Object} comment
     * @returns {Object}
     * @static
     */
    static toVote(comment) {
        return {
            id: comment.id,
            createdUser: comment.createdUser,
            createdUserName: comment.createdUserName,
            text: comment.comment,
            date: comment.dateCreated
        };
    }
}

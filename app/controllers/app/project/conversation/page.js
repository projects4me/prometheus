/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { peekOrPush } from 'prometheus/utils/live/collection';
import ThreadComments from 'prometheus/utils/state/thread-comments';
import ThreadVotes from 'prometheus/utils/state/thread-votes';
import ThreadParticipants, { buildParticipants } from 'prometheus/utils/state/thread-participants';
import ThreadActivities from 'prometheus/utils/state/thread-activities';

/**
 * The controller of one open thread: it owns the thread's comments (their own paged query, replies and the live
 * comment events of the open thread) and hands the layout controller to the template for the other thread actions
 * (vote, link an issue)
 *
 * @class Page
 * @namespace Prometheus.Controllers
 * @module App.Project.Conversation
 * @extends Controller
 */
export default class AppProjectConversationPageController extends Controller {
    /**
     * The store, used by the comments loader
     *
     * @property store
     * @type Ember.Service
     * @private
     */
    @service store;

    /**
     * The Hermes service, for the live comment events of the open thread
     *
     * @property hermes
     * @type Ember.Service
     * @private
     */
    @service hermes;

    /**
     * The layout controller that owns the thread actions and the members of the project
     *
     * @property layout
     * @type Controller
     * @public
     */
    @tracked layout = null;

    /**
     * The comments of the open thread, loaded with their own query
     *
     * @property threadComments
     * @type ThreadComments
     * @public
     */
    threadComments = new ThreadComments({ store: this.store, pageSize: 10, owner: this });

    /**
     * The votes of the open vote thread, loaded with their own query
     *
     * @property threadVotes
     * @type ThreadVotes
     * @public
     */
    threadVotes = new ThreadVotes({ store: this.store, owner: this });

    /**
     * The comment authors of the open discussion, loaded with their own minimal query
     *
     * @property threadParticipants
     * @type ThreadParticipants
     * @public
     */
    threadParticipants = new ThreadParticipants({ store: this.store, owner: this });

    /**
     * The newest activities of the open thread (started, edited, issue linked), for the Activity box
     *
     * @property threadActivities
     * @type ThreadActivities
     * @public
     */
    threadActivities = new ThreadActivities({ store: this.store, owner: this, limit: 5 });

    /**
     * The participants of the open thread: its creator, then the distinct authors of its comments or votes
     *
     * @property participants
     * @type Array
     * @public
     */
    get participants() {
        let room = this.model;
        if (!room) return [];
        let activity = room.roomType === 'vote' ? this.threadVotes.votes : this.threadParticipants.records;
        return buildParticipants(room.createdBy, activity);
    }

    /**
     * Disposer returned by hermes.register() for the open thread
     *
     * @property hermesDisposer
     * @type Function
     * @private
     */
    hermesDisposer = null;

    /**
     * Opens a thread: loads its newest comments (discussions) or its votes (vote threads) and listens to its comment events
     *
     * @method openThread
     * @param {Prometheus.Models.Conversationroom} room
     * @param {String} projectId
     * @returns {Promise} Resolves when the first page of comments is loaded
     * @public
     */
    openThread(room, projectId) {
        this.closeThread();
        this.threadActivities.open(room?.id ?? null);
        this.threadParticipants.open(room?.roomType === 'discussion' ? room.id : null);
        if (room?.roomType === 'vote') {
            this.threadComments.open(null);
            if (projectId) {
                this.hermesDisposer = this.hermes.register(this, projectId, {
                    'conversation.comment.created': this.handleVoteCreated.bind(this),
                    'conversation.comment.deleted': this.handleVoteDeleted.bind(this)
                });
            }
            return this.threadVotes.open(room.id);
        }
        this.threadVotes.open(null);
        if (!room || room.roomType !== 'discussion') {
            return this.threadComments.open(null);
        }
        if (projectId) {
            this.hermesDisposer = this.hermes.register(this, projectId, {
                'conversation.comment.created': this.handleCommentCreated.bind(this),
                'conversation.comment.updated': this.handleCommentUpdated.bind(this),
                'conversation.comment.deleted': this.handleCommentDeleted.bind(this)
            });
        }
        return this.threadComments.open(room.id);
    }

    /**
     * Stops listening to the open thread's comment events
     *
     * @method closeThread
     * @public
     */
    closeThread() {
        this.hermesDisposer?.();
        this.hermesDisposer = null;
    }

    /**
     * Saves the thread's edit through the layout, then reloads the Activity box: the edit recorded activities
     *
     * @method updateThread
     * @param {Prometheus.Models.Conversationroom} conversation
     * @param {Object} changes { subject, description, linkedIssue }
     * @returns {Promise}
     * @public
     */
    @action async updateThread(conversation, changes) {
        await this.layout.updateConversation(conversation, changes);
        if (!this.isDestroying && !this.isDestroyed) {
            this.threadActivities.reload();
        }
    }

    /**
     * Loads the next page of older comments (also retries a failed page)
     *
     * @method loadOlderComments
     * @returns {Promise}
     * @public
     */
    @action loadOlderComments() {
        return this.threadComments.loadOlder();
    }

    /**
     * Saves a reply through the layout and shows it as the newest comment of the open thread
     *
     * @method postComment
     * @param {String} relatedId
     * @param {String} contents
     * @param {Array} mentionedIssues
     * @returns {Promise<Object|undefined>}
     * @public
     */
    @action async postComment(relatedId, contents, mentionedIssues) {
        let comment = await this.layout.saveComment(relatedId, contents, mentionedIssues);
        if (this.isDestroying || this.isDestroyed) return comment;
        if (comment && this.threadComments.roomId === relatedId) {
            this.threadComments.add(comment);
            this.threadParticipants.add(comment);
        }
        return comment;
    }

    /**
     * Casts the user's vote on the open vote thread and counts it
     *
     * @method castVote
     * @param {String} text `I agree` or `I disagree`
     * @returns {Promise}
     * @public
     */
    @action async castVote(text) {
        let roomId = this.threadVotes.roomId;
        if (!roomId) return;
        let comment = await this.layout.vote(text, roomId);
        if (this.isDestroying || this.isDestroyed || !comment || this.threadVotes.roomId !== roomId) return;
        this.threadVotes.add(comment);
    }

    /**
     * Counts a vote created live in the open vote thread
     *
     * @method handleVoteCreated
     * @param {Object} envelope Domain-event envelope
     * @public
     */
    handleVoteCreated(envelope) {
        let roomId = envelope?.changes?.relatedId || envelope?.meta?.relatedId || envelope?.meta?.conversationId;
        if (!roomId || roomId !== this.threadVotes.roomId) return;
        this.threadVotes.add({ ...envelope.changes, id: envelope.resource.id });
    }

    /**
     * Stops counting a vote comment deleted live
     *
     * @method handleVoteDeleted
     * @param {Object} envelope Domain-event envelope
     * @public
     */
    handleVoteDeleted(envelope) {
        this.threadVotes.remove(envelope?.resource?.id);
    }

    /**
     * Adds a comment created in the open thread as its newest comment
     *
     * @method handleCommentCreated
     * @param {Object} envelope Domain-event envelope
     * @public
     */
    handleCommentCreated(envelope) {
        if (!this.isOpenThreadEvent(envelope)) return;
        let comment = peekOrPush(this.store, 'comment', envelope.resource.id, envelope.changes);
        this.threadComments.add(comment);
        this.threadParticipants.add(comment);
    }

    /**
     * Patches an updated comment of the open thread. The comment keeps its place: one that is not loaded yet
     * is not added, it shows with its changes when its page is loaded.
     *
     * @method handleCommentUpdated
     * @param {Object} envelope Domain-event envelope
     * @public
     */
    handleCommentUpdated(envelope) {
        if (!this.isOpenThreadEvent(envelope)) return;
        peekOrPush(this.store, 'comment', envelope.resource.id, envelope.changes);
    }

    /**
     * Removes a deleted comment from the open thread
     *
     * @method handleCommentDeleted
     * @param {Object} envelope Domain-event envelope
     * @public
     */
    handleCommentDeleted(envelope) {
        this.threadComments.remove(envelope?.resource?.id);
        this.threadParticipants.remove(envelope?.resource?.id);
    }

    /**
     * Whether a comment event belongs to the open thread
     *
     * @method isOpenThreadEvent
     * @param {Object} envelope Domain-event envelope
     * @returns {Boolean}
     * @private
     */
    isOpenThreadEvent(envelope) {
        let roomId = envelope?.changes?.relatedId || envelope?.meta?.relatedId || envelope?.meta?.conversationId;
        return Boolean(roomId) && roomId === this.threadComments.roomId;
    }

    /**
     * Stops listening when the controller goes away
     *
     * @method willDestroy
     * @private
     */
    willDestroy() {
        this.closeThread();
        super.willDestroy(...arguments);
    }
}

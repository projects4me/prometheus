/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { peekOrPush } from 'prometheus/utils/live/collection';
import ThreadComments from 'prometheus/utils/state/thread-comments';

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
     * Disposer returned by hermes.register() for the open thread
     *
     * @property hermesDisposer
     * @type Function
     * @private
     */
    hermesDisposer = null;

    /**
     * Opens a thread: loads its newest comments (discussions only) and listens to its comment events
     *
     * @method openThread
     * @param {Prometheus.Models.Conversationroom} room
     * @param {String} projectId
     * @returns {Promise} Resolves when the first page of comments is loaded
     * @public
     */
    openThread(room, projectId) {
        this.closeThread();
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
        }
        return comment;
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

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from 'prometheus/components/app';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

/**
 * A comment the user has posted that is not saved yet
 *
 * @class PendingComment
 * @namespace Prometheus.Components
 * @private
 */
class PendingComment {
    /**
     * Whether the last attempt to save the comment failed
     *
     * @property failed
     * @type Boolean
     * @public
     */
    @tracked failed = false;

    /**
     * @constructor
     * @param {String} content The comment
     * @param {Array} mentionedIssues The issues mentioned in the comment
     */
    constructor(content, mentionedIssues) {
        this.content = content;
        this.mentionedIssues = mentionedIssues;
    }
}

/**
 * The comment box at the end of the comments of a conversation or an issue. Posting a comment clears the box
 * straight away and shows the comment as pending until @save resolves. A comment that was not saved stays
 * pending, marked as failed, until the user retries or discards it. The comments are saved one after the other,
 * in the order they were posted; a failed comment does not hold back the ones after it, so a retried comment is
 * saved after them. ...attributes go on the footer of the box.
 *
 * @class ConversationUiCommentComposerComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 */
export default class ConversationUiCommentComposerComponent extends AppComponent {
    /**
     * PubSub service, used to clear the editor once a comment is posted
     *
     * @property pubSub
     * @type Ember.Service
     * @private
     */
    @service pubSub;

    /**
     * The pubSub event which clears this composer's editor only
     *
     * @property clearEvent
     * @type String
     * @private
     */
    clearEvent = `clearContents-${guidFor(this)}`;

    /**
     * The comments posted but not saved yet, in the order they were posted
     *
     * @property pendingComments
     * @type Array
     * @public
     */
    @tracked pendingComments = [];

    /**
     * The last save in the queue, so that each comment is saved after the ones posted before it
     *
     * @property queue
     * @type Promise
     * @private
     */
    queue = Promise.resolve();

    /**
     * Posts a comment: clears the editor, shows the comment as pending and saves it
     *
     * @method post
     * @param {Object} entity The entity the comment is on, passed back to @save
     * @param {String} content The comment
     * @param {Array} mentionedIssues The issues mentioned in the comment
     * @public
     */
    @action post(entity, content, mentionedIssues) {
        if (_.isEmpty(content)) {
            return;
        }
        let pending = new PendingComment(content, mentionedIssues);
        this.pendingComments = [...this.pendingComments, pending];
        this.pubSub.trigger(this.clearEvent);
        this._enqueue(pending);
    }

    /**
     * Tries to save a comment that failed again
     *
     * @method retry
     * @param {PendingComment} pending
     * @public
     */
    @action retry(pending) {
        pending.failed = false;
        this._enqueue(pending);
    }

    /**
     * Drops a comment that failed
     *
     * @method discard
     * @param {PendingComment} pending
     * @public
     */
    @action discard(pending) {
        this.pendingComments = this.pendingComments.filter((comment) => comment !== pending);
    }

    /**
     * Saves the comment after the comments queued before it. Once saved the comment leaves the pending ones;
     * the caller of the composer has added it to the comments by then.
     *
     * @method _enqueue
     * @param {PendingComment} pending
     * @return {Promise}
     * @private
     */
    _enqueue(pending) {
        this.queue = this.queue.then(async () => {
            if (!this.pendingComments.includes(pending)) {
                return;
            }
            try {
                await this.args.save(this.args.entity, pending.content, pending.mentionedIssues);
                if (!this.isDestroying && !this.isDestroyed) {
                    this.discard(pending);
                }
            } catch (error) {
                Logger.error('ConversationUiCommentComposerComponent::_enqueue - Error:', error);
                pending.failed = true;
            }
        });
        return this.queue;
    }
}

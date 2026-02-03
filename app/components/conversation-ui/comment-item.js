/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppComponent from 'prometheus/components/app';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * This component is used to render a single comment item in conversations and issues.
 *
 * @class ConversationUiCommentItemComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ConversationUiCommentItemComponent extends AppComponent {
    /**
     * The comment model to be displayed
     *
     * @property comment
     * @type Prometheus.Models.Comment
     * @public
     */
    get comment() {
        return this.args.comment;
    }

    /**
     * Flag to show or hide the delete comment confirmation modal
     *
     * @property showDeleteCommentModal
     * @type Boolean
     * @private
     */
    @tracked showDeleteCommentModal = false;

    /**
     * Computed property to check if the current user is the owner of the comment
     *
     * @property isOwnComment
     * @type Boolean
     * @public
     */
    get isOwnComment() {
        if (!this.comment || !this.currentUser?.user) {
            return false;
        }
        return this.comment.createdUser === this.currentUser.user.id;
    }

    /**
     * This action shows the delete comment confirmation modal
     *
     * @method showDeleteCommentDialog
     * @public
     */
    @action showDeleteCommentDialog() {
        this.showDeleteCommentModal = true;
    }

    /**
     * This action cancels the delete comment operation and closes the modal
     *
     * @method removeDeleteCommentModal
     * @public
     */
    @action removeDeleteCommentModal() {
        Logger.debug('ConversationUiCommentItemComponent::removeDeleteCommentModal');
        if (this.isDestroyed || this.isDestroying) return;
        this.showDeleteCommentModal = false;
        $('.modal').modal('hide');
        Logger.debug('ConversationUiCommentItemComponent::removeDeleteCommentModal - Done');
    }

    /**
     * This action deletes the comment after confirmation
     *
     * @method deleteComment
     * @public
     */
    @action async deleteComment() {
        Logger.debug('ConversationUiCommentItemComponent::deleteComment');
        let comment = this.comment;
        let messenger = new Messenger().post({
            message: this.intl.t("views.app.conversation.comment.delete.deleting"),
            type: 'success',
            showCloseButton: true
        });
        this.removeDeleteCommentModal();
        try {
        await comment.destroyRecord();
        messenger.update({
            message: this.intl.t("views.app.conversation.comment.delete.deleted"),
            type: 'success',
            showCloseButton: true
        });
    } catch (error) {
            Logger.error('ConversationUiCommentItemComponent::deleteComment - Error:', error);
            messenger.update({
                message: this.intl.t("views.app.conversation.comment.delete.error"),
                type: 'error',
                showCloseButton: true
            });
        }
    }
}

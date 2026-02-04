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
     * Flag to show or hide the edit comment modal
     *
     * @property showEditCommentModal
     * @type Boolean
     * @private
     */
    @tracked showEditCommentModal = false;

    /**
     * The edited comment content
     *
     * @property editedCommentContent
     * @type String
     * @private
     */
    @tracked editedCommentContent = '';

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
     * This action shows the edit comment dialog and populates it with current comment content
     *
     * @method showEditCommentDialog
     * @public
     */
    @action showEditCommentDialog() {
        Logger.debug('ConversationUiCommentItemComponent::showEditCommentDialog');
        // Set the initial content to the current comment content
        this.editedCommentContent = this.comment.comment || '';
        this.showEditCommentModal = true;
    }

    /**
     * This action cancels the edit comment operation and closes the modal
     *
     * @method removeEditCommentModal
     * @public
     */
    @action removeEditCommentModal() {
        Logger.debug('ConversationUiCommentItemComponent::removeEditCommentModal');
        if (this.isDestroyed || this.isDestroying) return;
        this.showEditCommentModal = false;
        this.editedCommentContent = '';
        $('.modal').modal('hide');
    }

    /**
     * This action handles content change in the ToastUI editor
     *
     * @method handleEditContentChange
     * @param {String} content The updated content from ToastUI
     * @public
     */
    @action handleEditContentChange(content) {
        this.editedCommentContent = content;
    }

    /**
     * This action updates the comment after user modifies and saves
     *
     * @method updateComment
     * @public
     */
    @action async updateComment() {
        Logger.debug('ConversationUiCommentItemComponent::updateComment');
        
        // Validate content
        if (!this.editedCommentContent || !this.editedCommentContent.trim()) {
            new Messenger().post({
                message: this.intl.t("views.app.conversation.comment.edit.empty"),
                type: 'error',
                showCloseButton: true
            });
            return;
        }

        let comment = this.comment;
        let messenger = new Messenger().post({
            message: this.intl.t("views.app.conversation.comment.edit.updating"),
            type: 'info',
            showCloseButton: false,
            hideAfter: false
        });

        try {
            comment.set('comment', this.editedCommentContent);
            await comment.save();
            
            messenger.update({
                message: this.intl.t("views.app.conversation.comment.edit.updated"),
                type: 'success',
                showCloseButton: true,
                hideAfter: 3
            });
            
            this.removeEditCommentModal();
        } catch (error) {
            Logger.error('ConversationUiCommentItemComponent::updateComment - Error:', error);
            comment.rollbackAttributes();
            messenger.update({
                message: this.intl.t("views.app.conversation.comment.edit.error"),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3
            });
        }
        
        Logger.debug('-ConversationUiCommentItemComponent::updateComment');
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

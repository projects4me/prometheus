import AppComponent from 'prometheus/components/app';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * This component is used to display a conversation item
 *
 * @class ConversationConversationItemComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ConversationConversationItemComponent extends AppComponent {
    /**
     * Flag to show or hide the edit conversation modal
     *
     * @property showEditConversationModal
     * @type Boolean
     * @private
     */
    @tracked showEditConversationModal = false;

    /**
     * The edited conversation subject
     *
     * @property editedSubject
     * @type String
     * @private
     */
    @tracked editedSubject = '';

    /**
     * The edited conversation description
     *
     * @property editedDescription
     * @type String
     * @private
     */
    @tracked editedDescription = '';

    /**
     * Computed property to check if the current user is the owner of the conversation
     *
     * @property isOwnConversation
     * @type Boolean
     * @public
     */
    get isOwnConversation() {
        if (!this.args.entity || !this.currentUser?.user) {
            return false;
        }
        return this.args.entity.createdUser === this.currentUser.user.id;
    }

    /**
     * This action shows the edit conversation dialog and populates it with current values
     *
     * @method showEditConversationDialog
     * @public
     */
    @action showEditConversationDialog() {
        Logger.debug('ConversationConversationItemComponent::showEditConversationDialog');
        this.editedSubject = this.args.entity.subject || '';
        this.editedDescription = this.args.entity.description || '';
        this.showEditConversationModal = true;
    }

    /**
     * This action cancels the edit conversation operation and closes the modal
     *
     * @method removeEditConversationModal
     * @public
     */
    @action removeEditConversationModal() {
        Logger.debug('ConversationConversationItemComponent::removeEditConversationModal');
        if (this.isDestroyed || this.isDestroying) return;
        this.showEditConversationModal = false;
        this.editedSubject = '';
        this.editedDescription = '';
        $('.modal').modal('hide');
    }

    /**
     * This action handles subject change in the form
     *
     * @method handleSubjectChange
     * @param {Event} event The input event
     * @public
     */
    @action handleSubjectChange(event) {
        this.editedSubject = event.target.value;
    }

    /**
     * This action handles description change in the ToastUI editor
     *
     * @method handleDescriptionChange
     * @param {String} content The updated description content from ToastUI
     * @public
     */
    @action handleDescriptionChange(content) {
        this.editedDescription = content;
    }

    /**
     * This action updates the conversation after user modifies and saves
     *
     * @method updateConversation
     * @public
     */
    @action async updateConversation() {
        Logger.debug('ConversationConversationItemComponent::updateConversation');

        // Validate subject
        if (!this.editedSubject || !this.editedSubject.trim()) {
            new Messenger().post({
                message: this.intl.t("views.app.conversation.edit.subjectEmpty"),
                type: 'error',
                showCloseButton: true
            });
            return;
        }

        let conversation = this.args.entity;
        let messenger = new Messenger().post({
            message: this.intl.t("views.app.conversation.edit.updating"),
            type: 'info',
            showCloseButton: false,
            hideAfter: false
        });

        try {
            conversation.set('subject', this.editedSubject);
            conversation.set('description', this.editedDescription);

            await conversation.save();
            messenger.update({
                message: this.intl.t("views.app.conversation.edit.updated"),
                type: 'success',
                showCloseButton: true,
                hideAfter: 3
            });

            this.removeEditConversationModal();
        } catch (error) {
            Logger.error('ConversationConversationItemComponent::updateConversation - Error:', error);
            conversation.rollbackAttributes();
            messenger.update({
                message: this.intl.t("views.app.conversation.edit.error"),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3
            });
        }

        Logger.debug('-ConversationConversationItemComponent::updateConversation');
    }
}

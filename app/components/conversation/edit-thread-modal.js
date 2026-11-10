import AppComponent from 'prometheus/components/app';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * The modal form that edits a thread's subject, description and linked issue; the save goes through @onSave
 *
 * @class ConversationEditThreadModalComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ConversationEditThreadModalComponent extends AppComponent {
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
     * The selected issue for linking ({ id, number, name } or null)
     *
     * @property editedLinkedIssue
     * @type {Object|null}
     * @private
     */
    @tracked editedLinkedIssue = null;

    /**
     * Fills the form with the thread's current values
     *
     * @constructor
     */
    constructor() {
        super(...arguments);
        let entity = this.args.entity;
        this.editedSubject = entity?.subject || '';
        this.editedDescription = entity?.description || '';
        let issue = entity?.issue;
        let issueId = issue?.get ? issue.get('id') : issue?.id;
        this.editedLinkedIssue = issueId
            ? { id: issueId, number: issue.get('issueNumber'), name: issue.get('subject') }
            : null;
    }

    /**
     * Closes the modal without saving
     *
     * @method close
     * @public
     */
    @action close() {
        Logger.debug('ConversationEditThreadModalComponent::close');
        $('.modal').modal('hide');
        if (typeof this.args.onClose === 'function') {
            this.args.onClose();
        }
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
     * Updates the selected linked issue in the form
     *
     * @method setEditedLinkedIssue
     * @param {Object|null} issue Option object with id, number, name
     * @public
     */
    @action setEditedLinkedIssue(issue) {
        this.editedLinkedIssue = issue;
    }

    /**
     * Hands the edited values to @onSave and closes the modal once they are saved
     *
     * @method updateConversation
     * @public
     */
    @action async updateConversation() {
        Logger.debug('ConversationEditThreadModalComponent::updateConversation');

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
            await this.args.onSave(conversation, {
                subject: this.editedSubject,
                description: this.editedDescription,
                linkedIssue: this.editedLinkedIssue
            });

            messenger.update({
                message: this.intl.t("views.app.conversation.edit.updated"),
                type: 'success',
                showCloseButton: true,
                hideAfter: 3
            });

            if (!this.isDestroying && !this.isDestroyed) {
                this.close();
            }
        } catch (error) {
            Logger.error('ConversationEditThreadModalComponent::updateConversation - Error:', error);
            messenger.update({
                message: this.intl.t("views.app.conversation.edit.error"),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3
            });
        }
    }
}

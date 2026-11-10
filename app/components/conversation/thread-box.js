import AppComponent from 'prometheus/components/app';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * The thread box of the thread page: the thread's header and description, with the body chosen by room type
 * (discussion comments; the vote body plugs in later)
 *
 * @class ConversationThreadBoxComponent
 * @namespace Prometheus.Components
 * @extends AppComponent
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ConversationThreadBoxComponent extends AppComponent {
    /**
     * Whether the edit thread modal is shown
     *
     * @property showEditConversationModal
     * @type Boolean
     * @private
     */
    @tracked showEditConversationModal = false;

    /**
     * Whether the thread is a discussion (a vote room shows the description only until the vote body is added)
     *
     * @property isDiscussion
     * @type Boolean
     * @public
     */
    get isDiscussion() {
        return this.args.entity?.roomType === 'discussion';
    }

    /**
     * Whether the current user started the thread
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
     * Shows the edit thread modal
     *
     * @method showEditConversationDialog
     * @public
     */
    @action showEditConversationDialog() {
        this.showEditConversationModal = true;
    }

    /**
     * Hides the edit thread modal
     *
     * @method removeEditConversationModal
     * @public
     */
    @action removeEditConversationModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.showEditConversationModal = false;
    }
}

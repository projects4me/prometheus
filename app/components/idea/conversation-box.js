/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isWorkingMessage } from 'prometheus/utils/idea/working-message';

/**
 * The conversation box of an idea page: the header with rename and archive, the thread of messages and
 * the composer. It only presents, the controller loads and saves through the callbacks.
 *
 * @class IdeaConversationBoxComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaConversationBoxComponent extends Component {
    /**
     * Whether the archive confirmation is open
     *
     * @property showArchiveModal
     * @type Boolean
     * @private
     */
    @tracked showArchiveModal = false;

    /**
     * Whether the idea is archived
     *
     * @property isArchived
     * @type Boolean
     * @public
     */
    get isArchived() {
        return this.args.idea.status === 'archived';
    }

    /**
     * The messages, oldest first; working messages are left out unless they are the last one
     *
     * @property orderedMessages
     * @type Array
     * @public
     */
    get orderedMessages() {
        let sorted = [...(this.args.messages ?? [])].sort((a, b) =>
            String(a.dateCreated).localeCompare(String(b.dateCreated)) || Number(a.id) - Number(b.id));
        let last = sorted[sorted.length - 1];
        // A working indicator only shows while it is the last message, a later message replaces it
        return sorted.filter(message => !isWorkingMessage(message) || message === last);
    }

    /**
     * Opens the archive (or unarchive) confirmation
     *
     * @method askArchive
     * @public
     */
    @action
    askArchive() {
        this.showArchiveModal = true;
    }

    /**
     * Closes the confirmation
     *
     * @method closeArchive
     * @public
     */
    @action
    closeArchive() {
        this.showArchiveModal = false;
    }

    /**
     * Archives or unarchives the idea after the confirmation
     *
     * @method confirmArchive
     * @returns {Boolean} true, for bootstrap-modal to hide the dialog
     * @public
     */
    @action
    confirmArchive() {
        Promise.resolve(this.args.onToggleArchive()).catch(() => {
            // Already reported and rolled back by the controller.
        });
        return true;
    }
}

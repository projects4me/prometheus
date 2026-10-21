/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
     * The messages, oldest first
     *
     * @property orderedMessages
     * @type Array
     * @public
     */
    get orderedMessages() {
        return [...(this.args.messages ?? [])].sort((a, b) =>
            String(a.dateCreated).localeCompare(String(b.dateCreated)) || Number(a.id) - Number(b.id));
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
     * @returns {Promise}
     * @public
     */
    @action
    async confirmArchive() {
        this.showArchiveModal = false;
        await this.args.onToggleArchive();
    }
}

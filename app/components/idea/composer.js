/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

/**
 * The composer of the conversation of an idea. Ctrl+Enter or the Send button sends the message, Enter adds a new line.
 * It only collects the text, @onSend creates the message.
 *
 * @class IdeaComposerComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaComposerComponent extends Component {
    /**
     * PubSub service, used to clear the editor after a message was sent
     *
     * @property pubSub
     * @type Ember.Service
     * @private
     */
    @service pubSub;

    /**
     * The text being written
     *
     * @property body
     * @type String
     * @private
     */
    @tracked body = '';

    /**
     * Whether a message is being sent
     *
     * @property isSending
     * @type Boolean
     * @private
     */
    @tracked isSending = false;

    /**
     * The composer is disabled while sending and when the idea is archived
     *
     * @property isDisabled
     * @type Boolean
     * @public
     */
    get isDisabled() {
        return this.isSending || Boolean(this.args.disabled);
    }

    /**
     * Keeps the text in step with the editor, which emits markdown
     *
     * @method updateBody
     * @param {String} markdown
     * @public
     */
    @action
    updateBody(markdown) {
        this.body = markdown;
    }

    /**
     * Ctrl+Enter sends, unless it only picked an item of the editor's suggestion menu
     *
     * @method handleKeyboardSubmit
     * @param {String} content
     * @param {Boolean} canSubmit
     * @public
     */
    @action
    handleKeyboardSubmit(content, canSubmit) {
        if (canSubmit) {
            this.send();
        }
    }

    /**
     * Sends the text and clears it when the message was created
     *
     * @method send
     * @returns {Promise}
     * @public
     */
    @action
    async send() {
        let body = (this.body ?? '').trim();
        if (this.isDisabled || !body) {
            return;
        }
        this.isSending = true;
        try {
            await this.args.onSend(body);
            this.body = '';
            this.pubSub.trigger('clearContents');
        } catch (error) {
            // Already reported by the controller. Keep the text so the user can retry.
        } finally {
            this.isSending = false;
        }
    }
}

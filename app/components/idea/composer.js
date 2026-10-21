/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * The composer of the conversation of an idea. Enter sends the message, Shift+Enter adds a new line.
 * It only collects the text, @onSend creates the message.
 *
 * @class IdeaComposerComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaComposerComponent extends Component {
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
     * Keeps the text in step with the field
     *
     * @method updateBody
     * @param {InputEvent} event
     * @public
     */
    @action
    updateBody(event) {
        this.body = event.target.value;
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
        } catch (error) {
            // Already reported by the controller. Keep the text so the user can retry.
        } finally {
            this.isSending = false;
        }
    }

    /**
     * Enter sends, Shift+Enter keeps the new line
     *
     * @method handleKeydown
     * @param {KeyboardEvent} event
     * @public
     */
    @action
    handleKeydown(event) {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.send();
        }
    }
}

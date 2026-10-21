/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const NOTICE_KINDS = ['system', 'error'];

/**
 * One message of the conversation of an idea. The kinds system and error are compact centred
 * notices, the others are comments with the author and the time.
 *
 * @class IdeaMessageItemComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaMessageItemComponent extends Component {
    /**
     * Whether the steps of the message are expanded
     *
     * @property showSteps
     * @type Boolean
     * @private
     */
    @tracked showSteps = false;

    /**
     * Whether the message is a compact notice
     *
     * @property isNotice
     * @type Boolean
     * @public
     */
    get isNotice() {
        return NOTICE_KINDS.includes(this.args.message.kind);
    }

    /**
     * Whether the message reports an error
     *
     * @property isError
     * @type Boolean
     * @public
     */
    get isError() {
        return this.args.message.kind === 'error';
    }

    /**
     * The steps of the message as text, the steps are a JSON array
     *
     * @property steps
     * @type Array
     * @public
     */
    get steps() {
        let steps = this.args.message.steps;
        if (!Array.isArray(steps)) {
            return [];
        }
        return steps.map(step => typeof step === 'string' ? step : (step?.title ?? step?.text ?? JSON.stringify(step)));
    }

    /**
     * Expands or collapses the steps
     *
     * @method toggleSteps
     * @public
     */
    @action
    toggleSteps() {
        this.showSteps = !this.showSteps;
    }
}

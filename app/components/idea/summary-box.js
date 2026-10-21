/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * The summary box of an idea page: the facts of the idea.
 *
 * @class IdeaSummaryBoxComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class IdeaSummaryBoxComponent extends Component {
    /**
     * The number of messages
     *
     * @property messageCount
     * @type Number
     * @public
     */
    get messageCount() {
        return (this.args.messages ?? []).length;
    }

    /**
     * The number of plan versions
     *
     * @property versionCount
     * @type Number
     * @public
     */
    get versionCount() {
        return (this.args.plans ?? []).length;
    }

    /**
     * The total cost of the messages in USD
     *
     * @property totalCost
     * @type String
     * @public
     */
    get totalCost() {
        let total = (this.args.messages ?? []).reduce((sum, message) => sum + (Number(message.costUsd) || 0), 0);
        return `$${total.toFixed(4)}`;
    }
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * Heading of one QuickList group: caret, label and item count, with the group's items yielded below it.
 *
 * Arguments: @group {key, label, items, count}, @collapsed (Boolean), @onToggle (action).
 *
 * @class QuickListGroupComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class QuickListGroupComponent extends Component {
    /**
     * The caret icon class for the current state
     *
     * @property caretClass
     * @type String
     */
    get caretClass() {
        return this.args.collapsed ? 'fa-caret-right' : 'fa-caret-down';
    }
}

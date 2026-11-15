/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * One tab of AppUi::Tabs, yielded as `t.tab`. `@name` identifies it, the optional `@count` shows a count label; it is active when it equals the
 * `@active` of the Tabs. `@active` and `@onSelect` are set by AppUi::Tabs.
 *
 * @class AppUiTabsTabComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class AppUiTabsTabComponent extends Component {
    /**
     * Whether this tab is the active one
     *
     * @property isActive
     * @type Boolean
     */
    get isActive() {
        return this.args.name === this.args.active;
    }

    /**
     * Whether the optional `@count` label is shown (0 is shown, null/undefined is not)
     *
     * @property hasCount
     * @type Boolean
     */
    get hasCount() {
        return this.args.count !== undefined && this.args.count !== null;
    }

    /**
     * Asks the owner to open this tab
     *
     * @method select
     * @param {Event} event
     */
    @action
    select(event) {
        event.preventDefault();
        this.args.onSelect?.(this.args.name);
    }
}

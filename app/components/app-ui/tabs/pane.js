/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * The content of one tab of AppUi::Tabs, yielded as `t.pane`. It renders only while its `@name` is the
 * active tab. `@active` is set by AppUi::Tabs.
 *
 * @class AppUiTabsPaneComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class AppUiTabsPaneComponent extends Component {
    /**
     * Whether this pane belongs to the active tab
     *
     * @property isActive
     * @type Boolean
     */
    get isActive() {
        return this.args.name === this.args.active;
    }
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The AppUi::Tabs demo of the Component Library: three tabs whose active name the demo owns and
 * sets from `@onChange`, which it also logs.
 *
 * @class DeveloperDemosTabsComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosTabsComponent extends Component {
    /**
     * The tab names
     *
     * @property names
     * @type Array
     */
    names = ['First', 'Second', 'Third'];

    /**
     * The tabs of the second demo, which show a count and tools
     *
     * @property counted
     * @type Array
     */
    counted = [
        { name: 'Open', count: 12 },
        { name: 'Closed', count: 0 }
    ];

    /**
     * The name of the active tab of the counted demo
     *
     * @property activeCounted
     * @type String
     */
    @tracked activeCounted = 'Open';

    /**
     * Logs the change and makes the named counted tab active
     *
     * @method changeCounted
     * @param {String} name
     */
    @action
    changeCounted(name) {
        this.activeCounted = name;
    }

    /**
     * The name of the active tab
     *
     * @property active
     * @type String
     */
    @tracked active = 'First';

    /**
     * Logs the change and makes the named tab active
     *
     * @method change
     * @param {Object} log The demo event log
     * @param {String} name The tab that was selected
     */
    @action
    change(log, name) {
        log.log('change', { name });
        this.active = name;
    }

    /**
     * Makes the first tab active again
     *
     * @method reset
     */
    @action
    reset() {
        this.active = 'First';
        this.activeCounted = 'Open';
    }
}

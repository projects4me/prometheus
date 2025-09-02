/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component is used to an exception, if there is no content to display.
 *
 * @class ExceptionsNothingFoundComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ExceptionsNothingFoundComponent extends Component {
    /**
     * Whether the info icon is required.
     * @property infoIconRequired
     * @type {boolean}
     * @public
     */
    get infoIconRequired() {
        return this.args.infoIcon === true || this.args.infoIcon === undefined;
    }
}

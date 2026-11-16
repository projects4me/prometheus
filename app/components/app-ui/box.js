/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

const VARIANTS = ['primary', 'default', 'info', 'success', 'warning', 'danger'];

/**
 * An AdminLTE box with header, tools, body and footer blocks.
 *
 * @class AppUiBoxComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiBoxComponent extends Component {
    /**
     * The colour variant: primary (default), default, info, success, warning or danger.
     *
     * @property variant
     * @type String
     */
    get variant() {
        return VARIANTS.includes(this.args.variant) ? this.args.variant : 'primary';
    }
}

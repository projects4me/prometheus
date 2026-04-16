/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This renders a checkbox of type switch which represents user account status.
 *
 * @class FieldSwitch
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class FormFieldsFieldSwitchComponent extends Component {

    /**
     * This function returns checked value.
     * 
     * @method get
     */
    get checked() {
        return Boolean(this.args.checkedValue);
    }

    /**
     * This function returns size class for switch variants.
     *
     * @method get
     */
    get sizeClass() {
        let validSizes = ['sm', 'md', 'lg'];
        let size = this.args.size;

        if (!validSizes.includes(size)) {
            return 'switch-control--md';
        }

        return `switch-control--${size}`;
    }

}

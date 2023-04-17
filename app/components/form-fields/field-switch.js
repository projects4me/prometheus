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
        return (this.args.checkedValue) ? 'checked' : null;
    }

}

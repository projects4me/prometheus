/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import FormFieldsComponent from "./form-fields";

/**
 * This is the checkbox field component.
 *
 * @class FieldText
 * @namespace Prometheus.Components
 * @extends FormField
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class FieldTextComponent extends FormFieldsComponent {
    
    /**
     * This property store length of input field's value
     *
     * @property
     * @type Integer
     * @for FieldText
     * @protected
     */
    length = 0;

    /**
     * This function calculate the length of input field's value
     *
     * @property
     * @type String
     * @for FieldText
     * @protected
     */
    get charLength() {
        if (this.value != undefined) {
            this.length = this.value.length;
        }
        return this.length;
    }
    
    /**
     * This function returns value
     *
     * @method get
     * @public
     */
    get value() {
        return this.args.value;
    }
}
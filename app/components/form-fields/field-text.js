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
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class FieldTextComponent extends FormFieldsComponent {

    /**
     * The type of the field, this is added here so that we can have major
     * functionality in the form-fields component and only extend what is required
     *
     * @property
     * @type String
     * @for FieldText
     * @protected
     */
    type = "text";

    /**
     * This function calculate the length of input field's value
     *
     * @property
     * @type String
     * @for FieldText
     * @protected
     */
    get charLength() {
        let length = 0;
        if (this.value != undefined) {
            length = this.value.length;
        }
        return length;
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
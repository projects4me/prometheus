/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import FormFieldsComponent from "./form-fields";

/**
 * This is the date field
 *
 * @class FieldDate
 * @namespace Prometheus.Components
 * @extends FormField
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class FieldDateComponent extends FormFieldsComponent {

    /**
     * This function returns update property which has 'selectStatic' function inside it.
     *
     * @method get
     * @public
     */
    get update() {
        return this.args.update;
    }
}

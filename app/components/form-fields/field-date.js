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
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class FieldDateComponent extends FormFieldsComponent {

    /**
     * This function calculate and returns max date.
     * 
     * @method get
     * @public
     */
    get maxDate() {
        let currentYear = moment().year();
        return currentYear + 30;
    }

}

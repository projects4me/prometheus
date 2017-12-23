/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

//import Ember from "ember";
import FormField from "prometheus/components/form-fields";

/**
 * This is the checkbox field component.
 *
 * @class FieldCheckbox
 * @namespace Prometheus.Components
 * @extends FormField
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default FormField.extend({

    /**
     * The type of the field, this is added here so that we can have major
     * functionality in the form-fields component and only extend what is required
     *
     * @property type
     * @type String
     * @for FieldCheckbox
     * @protected
     */
    type: "checkbox",

    /**
     * Set the empty state for the checkbox field
     *
     * @method setEmpty
     * @protected
     */
    setEmpty(){
        let isEmpty = false;
        const value = this.get('value');

        if (this.get('oldValue') === null) {
            if (value === undefined) {
                this.set('value',false);
                this.set('oldValue',false);
            }
            else {
                this.set('oldValue',value);
            }
        }

        if (value === null || value === undefined) {
            isEmpty = true;
        }
        else {
            if (value === false) {
                isEmpty = true;
            }
        }
        this.set('isEmpty',isEmpty);
    }
});
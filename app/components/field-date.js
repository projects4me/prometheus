/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import FormField from "../components/form-fields";

/**
 * This is the date field
 *
 * @class FieldDate
 * @namespace Prometheus.Components
 * @extends FormField
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default FormField.extend({
    /**
     * The type of the field, this is added here so that we can have major
     * functionality in the form-fields component and only extend what is required
     *
     * @property
     * @type String
     * @for FieldDate
     * @protected
     */
    type: "date",

    /**
     * The char length
     *
     * @property
     * @type function
     * @for FieldDate
     * @protected
     */
    charLength: Ember.computed('value', function() {
        return (this.get('value'));
    }),
});

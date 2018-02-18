/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import FormField from "../components/form-fields";
import { computed } from '@ember/object';
/**
 * This is the checkbox field component.
 *
 * @class FieldText
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
     * @for FieldText
     * @protected
     */
    type: "text",

    /**
     * The char length
     *
     * @property
     * @type String
     * @for FieldText
     * @protected
     */
    charLength: computed('value', function() {
        return (this.get('value'));
    }),

});
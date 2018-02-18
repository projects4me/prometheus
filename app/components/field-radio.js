/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import FormField from "../components/form-fields";
import $ from 'jquery';

/**
 * This is the checkbox field component.
 *
 * @class FieldRadio
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
     * @for FieldRadio
     * @protected
     */
    type: "radio",

    /**
     * These are the events that this components is listening to
     *
     * @property actions
     * @type Obeject
     * @for FieldRadio
     * @public
     */
    actions:{

        /**
         * This function is called when a field has been changed. We set the value in the component
         *
         * @method changed
         * @public
         */
        changed:function(){
            let val = $('#'+this.elementId+' [name='+this.elementId+'-option]:checked').val();
            this.set('value',val);
        }
    },

});
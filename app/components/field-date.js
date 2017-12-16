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

    /**
     * This function is called when the view has been rendered, we should ideally
     * use didRender but it was getting called every time the value was changed
     * which would mean that we have to add a mask every time a value is changed
     * that would not be good.
     *
     * @method didInsertElement
     * @private
     */
    didInsertElement:function(){
        let _self = this;
        const mask = _self.getMask(this.get('mask'));
        const tagName = _self.getTag(this.get('type'));

        if (mask !== undefined && mask !== '' && tagName !== undefined && tagName !== '') {
            Ember.$('#'+_self.elementId+' '+tagName).mask(mask.mask,{translation:mask.maskTranslation});
        }

        Ember.$('#'+_self.elementId+' input').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            locale: {
                format: 'YYYY-MM-DD'
            }
        });

        Ember.$('#'+_self.elementId+' input').on('apply.daterangepicker', function(ev, picker) {
            if (typeof _self.update === 'function') {
                _self.sendAction('update',picker.startDate.format('YYYY-MM-DD'));
            }
        });
    },
});

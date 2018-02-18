/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Checkbox from '@ember/component/checkbox';

/**
 * This object is used to modify the default TextFeild of emberjs in order to
 * allow run time binding of fields based on metadata. By default emberjs
 * does not allow valueBinding with dynamic field names.
 * This code is a slightly modifed version of code implemented by Jason Porritt
 * which can be found here
 * https://gist.github.com/jasonporritt/5473506#file-dynamic_bound_text_field-coffee
 * Thank you Jason for sharing :), I have been at this problem for some time now.
 *
 * @class CheckboxField
 * @namespace Prometheus.Components
 * @extends Ember.Checkbox
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Checkbox.extend({

    /**
     * Adding paramater binding for data-select so that it is disabled on the view and then used to identify selected
     * items
     *
     * @property attributeBindings
     * @type Array
     * @for CheckboxField
     * @private
     */
    attributeBindings: ['data-select'],

    /**
     * Setup a listerer on field change on initialization
     *
     * @method onInit
     * @private
     */
    onInit: function(){
        let action = this.get('action');
        if(action){
            this.on('change', this, this.changeEvent);
        }
    }.on('init'),

    /**
     * Forward the action to the field-view controller to handle
     *
     * @method changeEvent
     * @public
     */
    changeEvent(){
        this.sendAction('action',  this.$().prop('checked'));
    },

    /**
     * Cleanup the event registered up destruction of the view to avoid memory leaks
     *
     * @method cleanup
     * @public
     */
    cleanup: function(){
        this.off('change', this, this.changeEvent);
    }.on('willDestroyElement')
});
/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Checkbox from '@ember/component/checkbox';
import { get } from '@ember/object';

/**
 * This object is used to modify the default TextField of EmberJs in order to
 * allow run time binding of fields based on metadata. By default EmberJs
 * does not allow valueBinding with dynamic field names.
 * This code is a slightly modified version of code implemented by Jason Porritt
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
     * Adding parameter binding for data-select so that it is disabled on the view and then used to identify selected
     * items
     *
     * @property attributeBindings
     * @type Array
     * @for CheckboxField
     * @private
     */
    attributeBindings: ['data-select'],

    /**
     * Setup a listener on field change on initialization
     *
     * @method init
     * @private
     */
    init(){
        this._super(...arguments);

        let action = this.get('action');
        if(action){
            this.on('change', this, this.changeEvent);
        }
    },

    /**
     * Forward the action to the field-view controller to handle
     *
     * @method changeEvent
     * @public
     */
    changeEvent(){
        get(this, 'action')(this.$().prop('checked'));
        //this.sendAction('action',  );
    },

    /**
     * Cleanup the event registered up destruction of the view to avoid memory leaks
     *
     * @method cleanup
     * @public
     */
    willDestroyElement(){
        this.off('change', this, this.changeEvent);
    }
});
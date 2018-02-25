/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
//import Validator from  "../utils/validator/fields";
import { computed } from '@ember/object';
import { cancel } from '@ember/runloop';
import { later } from '@ember/runloop';
import $ from 'jquery';

/**
 * This component is used to serve as a container for the fields that we intend to
 * use in the system.
 *
 * The main features that we wish to provide in the system with respect the form
 * fields all
 *
 * inline edit
 * floating labels
 * help text
 * validation with masking
 *
 * each form field will be rendered on its own.
 *
 * @class FormFields
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The type of the current field, the default type is text. If the field type
     * is not specified then we will render the field as text field.
     *
     * @property type
     * @type String
     * @for FormFields
     * @private
     */
    type : 'text',

    /**
     * This flag is used to check whether the field is editable or not. The default
     * value is true
     *
     * @property isEditable
     * @type Boolean
     * @for FormFields
     * @private
     */
    isEditable: true,

    /**
     * This flag is used to specify the state of the field's contents, whether they
     * are empty or not. The default value is true
     *
     * @property isEmpty
     * @type Boolean
     * @for FormFields
     * @private
     */
    isEmpty: true,

    /**
     * This flag is used to specify the state of the field's contents, whether they
     * are valid or not. The default value is true. Normally this flag will always
     * be true because it is better to mask the contents with respect to the valid
     * input rather than showing that the data is invalid
     *
     * @property isValid
     * @type Boolean
     * @for FormFields
     * @private
     */
    isValid: true,

    /**
     * Some fields may required us to fetch the information from an API, which would
     * mean that the contents would not be available immediately. This flag is used
     * to specify the state of the field's contents, whether they have finished
     * loading or not. The default value is true.
     *
     * @property isLoading
     * @type Boolean
     * @for FormFields
     * @private
     */
    isLoading: true,

    /**
     * This flag is used to specify the state of the field, whether the user is
     * typing in it or not. The default value of the field is false
     *
     * @property isTyping
     * @type Boolean
     * @for FormFields
     * @private
     */
    isTyping: false,

    /**
     * Some fields may not be viewable at all, This checks supersedes the checks
     * for edit and isEditable. The default value is true
     *
     * @property isViewable
     * @type Boolean
     * @for FormFields
     * @private
     */
    isViewable: true,

    /**
     * This flag is used to maintain the state of the field, whether it has been
     * changed or not. The default value is false
     *
     * @property isChanged
     * @type Boolean
     * @for FormFields
     * @private
     */
    isChanged: computed('value', 'oldValue', function() {
        Logger.debug(this.get('value'));
        Logger.debug(this.get('oldValue'));
        return (this.get('value') !== this.get('oldValue'));
    }),

    /**
     * Some fields are dependant on other fields or rules. This flag is used to
     * specify whether it is or not. The default value is false
     *
     * @property isDependant
     * @type Boolean
     * @for FormFields
     * @private
     */
    isDependant: false,

    /**
     * This flag is used to maintain whether the field is required or not. The
     * default is false
     *
     * @property isRequired
     * @type Boolean
     * @for FormFields
     * @private
     */
    isRequired: false,

    /**
     * This flag is used specify whether we need to load the field in an editable
     * manner. This is different from editable as it supersedes the editable flag.
     * A field may be disabled for edit view but due to acl or dependencies it may
     * not be editable.
     *
     * @property edit
     * @type Boolean
     * @for FormFields
     * @private
     */
    edit: true,

    /**
     * Class name bindings are used to add a class name in all the rendered
     * blocks of the form-field instance. They are used so that we can control the
     * way the field is rendered
     *
     * @property classNameBindings
     * @type Array
     * @for FormFields
     * @private
     */
    classNames: ['form-field'],

    /**
     * This is the property that is used to set the set the scheduled events e.g.
     * isTyping under check
     *
     * @property scheduler
     * @type Ember.run
     * @for FormFields
     * @private
     */
    scheduler: null,

    /**
     * This field stores the old value for audit purposed.
     *
     * @property oldValue
     * @type mixed
     * @for FormFields
     * @private
     */
    oldValue: null,

    /**
     * All the fields will have their own display needs so instead of handling
     * them all in template, which would be very very unwise as we are talking
     * about handlebars, we would wish to load a different template based on the
     * field type being requested.
     *
     * @property layoutName
     * @type function
     * @return template {String} The template name that will be rendered
     * @private
     */
    layoutName: computed('type', 'model', function() {
        let type = this.get('type');
        //var edit = this.get('edit');

        let template = 'components/form-fields/'+type;
        if (Prometheus.__container__.lookup('template:'+template) === undefined) {
            template = 'components/form-fields/text';
        }

        return template;
    }).volatile(),

    /**
     * During the initialize ohase of the field we are need to evaluate if the
     * field is empty, if so then set the isEmpty flag to true otherwise false
     *
     * @method didReceiveAttrs
     * @public
     * @todo check for Array and support EmptyObject, EmberModel, etc.
     */
    didReceiveAttrs() {
        this._super(...arguments);
        this.setEmpty();
    },

    /**
     * This function is used to set the empty flag, this is isolated so that it
     * can be overridden by the form components whenever required.
     *
     * @method setEmpty
     * @protected
     */
    setEmpty(){
        let isEmpty = false;
        const value = this.get('value');

        if (this.get('oldValue') === null) {
            if (value === undefined) {
                this.set('value','');
                this.set('oldValue','');
            }
            else {
                this.set('oldValue',value);
            }
        }

        if (value === null || value === undefined) {
            isEmpty = true;
        }
        else {
            if (typeof value === 'string' && value === '') {
                isEmpty = true;
            }
            else if (typeof value === 'object' && value.length === 0) {
                isEmpty = true;
            }
        }
        this.set('isEmpty',isEmpty);
    },

    /**
     * This function is called when the view has been rendered, we should ideally
     * use didRender but it was getting called every time the value was changed
     * which would mean that we have to add a mask every time a value is changed
     * that would not be good.
     *
     * @method didInsertElement
     * @private
     */
    didInsertElement(){
        const mask = this.getMask(this.get('mask'));
        const tagName = this.getTag(this.get('type'));

        if (mask !== undefined && mask !== '' && tagName !== undefined && tagName !== '') {
            $('#'+this.elementId+' '+tagName).mask(mask.mask,{translation:mask.maskTranslation});
        }

        if (this.type === 'enum' || this.type === 'multienum') {
            $('#'+this.elementId+' select').selectpicker();
        }
        else if (this.type === 'date') {
            $('#'+this.elementId+' input').daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
               locale: {
                   format: 'YYYY-MM-DD'
               }
            });
        }
        else if (this.type === 'datetime') {
            $('#'+this.elementId+' input').daterangepicker({
                singleDatePicker: true,
                timePicker: true,
                showDropdowns: true,
                locale: {
                    format: 'MMMM D, YYYY  h:mm A'
                }
            });
        }
        else if (this.type === 'email') {
            $('#'+this.elementId+' input').mask("A", {
                translation: {
                    "A": { pattern: /[\w@\-.+]/, recursive: true }
                }
            });
        }

    },

    /**
     * This function is used retrive the mask options
     *
     * @method getMask
     * @param mask {String} The mask required e.g. alpha, alphanumeric, email, etc.
     * @return maskOptions {Object} The settings required for masking the data
     * @todo possibly store the masks and options somewhere else to allow customizations
     */
    getMask(mask){
        const masks = {
            'alpha' : {
                'mask' : "C",
                'maskTranslation': {
                    "C": { pattern: /^[a-zA-Z\s]+$/, recursive: true }
                }
            },
            'alphanumeric' : {
                'mask' : "C",
                'maskTranslation': {
                    "C": { pattern: /^[a-zA-Z0-9\s]+$/, recursive: true }
                }
            },
            'email' : {
                'mask' : "C",
                'maskTranslation': {
                    "C": { pattern: /[\w@\-.+]/, recursive: true }
                }
            }

        };
        return masks[mask];
    },

    /**
     * This function is used to retrive the tag that is to be used for the selection
     * for a type
     *
     * @method getTag
     * @param type {String} The type of field requried
     * @return tagname {String} The tag name for the field type
     */
    getTag(type){
        const tagNames = {
            'text' : 'input',
            'textarea' : 'textarea',
            'date' : 'input',
        };
        return tagNames[type];
    },

    /**
     * This function is fired when a user presses a key on the keybord. We capture
     * this event in order to set the flag isTyping
     *
     * @method keyDown
     * @public
     */
    keyDown(){
        if (this.get('isTyping') === false) {
            this.set('isTyping',true);
        }
    },

    /**
     * This function if fired when a user releases a key on the keyborad. We are
     * capturing this event in order to update the isTyping flag. We are taking the
     * average typing speed of 41.4 words per minutes which is 0.69 words per second,
     * which results in 1495ms per word.
     *
     * @method keyUp
     * @public
     * @todo Maybe we can calculate the average typing speed at run time based on the user who is typing.
     * @todo Should clear the data on focus-out as well.
     */
    keyUp(){
        const self = this;
        if (self.scheduler !== null)
        {
            cancel(self.scheduler);
        }

        self.scheduler = later((function(){
            self.set('isTyping',false);
        }),1500);
    }

});
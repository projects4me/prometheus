/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { cancel } from '@ember/runloop';
import { later } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import Logger from 'js-logger';
import { action } from '@ember/object';

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
export default class FormFieldsComponent extends Component {

    /**
     * The type of the current field, the default type is text. If the field type
     * is not specified then we will render the field as text field.
     *
     * @property type
     * @type String
     * @for FormFields
     * @private
     */
    type = 'text';

    /**
     * This flag is used to check whether the field is editable or not. The default
     * value is true
     *
     * @property isEditable
     * @type Boolean
     * @for FormFields
     * @private
     */
    isEditable = true;

    /**
     * This flag is used to specify the state of the field's contents, whether they
     * are empty or not. The default value is true
     *
     * @property isEmpty
     * @type Boolean
     * @for FormFields
     * @private
     */
    isEmpty = true;

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
    isValid = true;

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
    isLoading = true;

    /**
     * This flag is used to specify the state of the field, whether the user is
     * typing in it or not. The default value of the field is false
     *
     * @property isTyping
     * @type Boolean
     * @for FormFields
     * @private
     */
    isTyping = false;

    /**
     * Some fields may not be viewable at all, This checks supersedes the checks
     * for edit and isEditable. The default value is true
     *
     * @property isViewable
     * @type Boolean
     * @for FormFields
     * @private
     */
    isViewable = true;

    /**
     * This property is used to keep track the disabled value of the input and textarea
     * elements. This property is used (for now) when inline editing is required.
     *
     * @property disabled
     * @type Boolean
     * @for FormFields
     * @protected
     */
    @tracked disabled = true;

    /**
     * During the initialize phase of the field we need to evaluate if the
     * field is empty, if so then set the isEmpty flag to true otherwise false
     *
     * @method constructor
     * @public
     * @todo check for Array and support EmptyObject, EmberModel, etc.
     */
    constructor() {
        super(...arguments);
        this.setEmpty();
    }

    /**
     * This flag is used to maintain the state of the field, whether it has been
     * changed or not. The default value is false
     *
     * @property isChanged
     * @type Boolean
     * @for FormFields
     * @private
     */
    get isChanged() {
        Logger.debug('Value : ' + this.value);
        Logger.debug('Old Value : ' + this.oldValue);
        if (this.value == undefined)
            return false;
        return (this.value !== this.oldValue);
    }

    get typing() {
        return this.isTyping;
    }

    set typing(value) {
        this.isTyping = value;
    }

    /**
     * Some fields are dependant on other fields or rules. This flag is used to
     * specify whether it is or not. The default value is false
     *
     * @property isDependant
     * @type Boolean
     * @for FormFields
     * @private
     */
    isDependant = false;

    /**
     * This flag is used to maintain whether the field is required or not. The
     * default is false
     *
     * @property isRequired
     * @type Boolean
     * @for FormFields
     * @private
     */
    isRequired = false;

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
    edit = true;

    /**
     * This is the property that is used to set the set the scheduled events e.g.
     * isTyping under check
     *
     * @property scheduler
     * @type Ember.run
     * @for FormFields
     * @private
     */
    scheduler = null;

    /**
     * This field stores the old value for audit purposed.
     *
     * @property oldValue
     * @type mixed
     * @for FormFields
     * @private
     */
    oldValue = null;

    /**
     * This property is used as a flag show error to user for required fields.
     * When we focus out from a field and if that field is empty then this property
     * will be set to true. Initially its value is false.
     * @property shouldValidate
     * @type Bool
     * @for FieldText
     * @private
     */
    @tracked shouldValidate = false;

    /**
     * This function is used to set the empty flag, this is isolated so that it
     * can be overridden by the form components whenever required.
     *
     * @method setEmpty
     * @protected
     */
    setEmpty() {
        let isEmpty = false;
        const value = this.value;

        if (this.oldValue === null) {
            if (value === undefined) {
                //this.set('value','');
                this.oldValue = '';
            }
            else {
                this.oldValue = value;
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
        this.isEmpty = isEmpty;
    }

    /**
     * This function is fired when a user presses a key on the keybord. We capture
     * this event in order to set the flag isTyping
     *
     * @method keyDown
     * @public
     */
    keyDown() {
        if (this.isTyping === false) {
            this.typing = true;
        }
    }

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
    keyUp() {
        const self = this;
        if (self.scheduler !== null) {
            cancel(self.scheduler);
        }

        self.scheduler = later((function () {
            self.set('isTyping', false);
        }), 1500);
    }

    /**
     * This method returns function that is passed to the component in order to validate
     * the field.
     * 
     * @method get
     * @protected
     */
    get validate() {
        return this.args.validate ?? (() => true);
    }

    /**
     * This method toggle the disabled value of given type of html element.
     * 
     * @param {HTMLInputElement|HTMLTextAreaElement} elementType 
     * @method toggleDisabled
     * @protected
     */
    @action toggleDisabled(elementType) {
        this.setDisabledValue(elementType, false);
    }

    /**
     * This function saves the inline edited field value.
     * 
     * @param {HTMLInputElement|HTMLTextAreaElement} elementType
     * @method saveInlineField
     * @protected
     */
    @action saveInlineField(elementType) {
        if (!this.args.message) {
            let disabledEl = this.setDisabledValue(elementType, true);
            let fieldName = (this.args['data-field']).split('.')[1];
            this.args.editCb(fieldName, disabledEl.value);
        }
    }

    /**
     * This function set the disabled value of given html element to true.
     * 
     * @param {HTMLInputElement|HTMLTextAreaElement} elementType 
     * @method closeInlineField
     * @protected
     */
    @action closeInlineField(elementType) {
        if (!this.args.message) {
            this.setDisabledValue(elementType, true);
        }
    }

    /**
     * This function set the disabled value of given html element according to
     * the given value.
     * 
     * @param {HTMLInputElement|HTMLTextAreaElement} elementType 
     * @param {Boolean} isDisabled 
     * @method setDisabledValue
     * @returns {HTMLInputElement|HTMLTextAreaElement} el
     */
    setDisabledValue(elementType, isDisabled) {
        let fieldName = this.args['data-field'];
        let el = document.querySelector(`[data-field="${fieldName}"] ${elementType}`);
        this.disabled = el.disabled = isDisabled;
        return el;
    }
}
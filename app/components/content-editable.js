/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import { once } from '@ember/runloop';
import { computed } from '@ember/object';
import { observer } from '@ember/object';

/**
 * This component is used to render the HTML5 div with contenteditable property
 * inspired from https://github.com/KasperTidemann/ember-contenteditable-view
 *
 * @class ContentEditable
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The tag to be used for this component
     *
     * @property tagName
     * @for ContentEditable
     * @type String
     * @private
     */
    tagName: 'div',

    /**
     * The attributes that should be rendered with the element
     *
     * @property attributeBindings
     * @for ContentEditable
     * @type Array
     * @private
     */
    attributeBindings: ['contenteditable','spellcheck','placeholder'],

    /**
     * The classes to be rendered with the element
     *
     * @property classNames
     * @for ContentEditable
     * @type Array
     * @private
     */
    classNames: ["editable"],

    /**
     * The flag that allows editing
     *
     * @property editable
     * @for ContentEditable
     * @type boolean
     * @public
     */
    editable: true,

    /**
     * The flag that controls spell checking
     *
     * @property checkSpelling
     * @for ContentEditable
     * @type boolean
     * @public
     */
    checkSpelling: false,

    /**
     * The flag that indicates whether a user is typing in the field or not
     *
     * @property isUserTyping
     * @for ContentEditable
     * @type boolean
     * @public
     */
    isUserTyping: false,

    /**
     * The flag that forces only plaintext to be used
     *
     * @property plaintext
     * @for ContentEditable
     * @type boolean
     * @public
     */
    plaintext: false,

    /**
     * The function that enables or disables editing in the div
     *
     * @property contenteditable
     * @for ContentEditable
     * @type function
     * @public
     */
    contenteditable: computed('editable' ,function() {
        let editable = this.editable;

        return editable ? 'true' : undefined;
    }),

    /**
     * The function that enables or disables spell checking
     *
     * @property spellcheck
     * @for ContentEditable
     * @type function
     * @public
     */
    spellcheck: computed('checkSpelling', function() {
        let spelling = this.checkSpelling;

        return spelling ? 'true' : 'false';
    }),

    /**
     * The observer on value and isUserTyping
     *
     * @property valueObserver
     * @for ContentEditable
     * @type function
     * @public
     */
    valueObserver: observer('value', 'isUserTyping', function() {
        once(this, 'processValue');
    }),

    /**
     * This function is used in to set the contents after a value has been changed
     *
     * @method processValue
     * @return {*}
     * @public
     */
    processValue() {
        if (!this.isUserTyping && this.value) {
            return this.setContent();
        }
    },

    /**
     * This function is called by Ember when the HTML elements have been rendered in the view
     *
     * @method didInsertElement
     * @return {*}
     * @public
     */
    didInsertElement() {
        return this.setContent();
    },

    /**
     * This is an event handler function which is called when the focus is removed from the div
     *
     * @method focusOut
     * @return {*}
     * @public
     */
    focusOut() {
        return this.set('isUserTyping', false);
    },

    /**
     * This is an event handler function which is called when a key is pressed in the div
     *
     * @method keyDown
     * @param {Object} event
     * @return {*}
     * @public
     */
    keyDown(event) {
        if (!event.metaKey) {
            return this.set('isUserTyping', true);
        }
    },

    /**
     * This is an event handler function which is called when a key is released from the div
     *
     * @method keyUp
     * @return {*}
     * @public
     */
    keyUp() {
        return this.set('value', this.$().html());
    },

    /**
     * This is the function called to retrieve the contents in the element to set up in the component
     *
     * @method setContent
     * @return {*}
     * @public
     */
    setContent() {
        //return this.$().html(Ember.Handlebars.Utils.escapeExpression(this.get('value')));
        return this.value;
    }
});

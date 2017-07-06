/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This component is used to render the chat-boxes in the application
 *
 * @class ChatBox
 * @namespace Prometheus.Component
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for ChatBox
     * @private
     */
    i18n: Ember.inject.service(),

    /**
     * These are the classes the must be registered with the component
     *
     * @property classNames
     * @type Array
     * @for ChatBox
     * @private
     */
    classNames: ["chat-boxes"],

    /**
     * Flag that maintains whether the user is typing or not
     *
     * @property isUserTyping
     * @type Bool
     * @for ChatBox
     * @private
     */
    isUserTyping: false,


    /**
     * This function is called when the object is created, we are using this
     * function to translate the emojis
     *
     * @method init
     * @private
     */
    init:function(){
        this._super(...arguments);
    },
});
/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import $ from 'jquery';

/**
 * This component is used to render the chat-boxes in the application
 *
 * @class ChatBox
 * @namespace Prometheus.Component
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for ChatBox
     * @private
     */
    i18n: inject(),

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

    didInsertElement(){
        let o = $.AdminLTE.options;

        //Activate direct chat widget
        $(document).on('click', o.directChat.contactToggleSelector, function () {
            let box = $(this).parents('.direct-chat').first();
            box.toggleClass('direct-chat-contacts-open');
        });
    }

});
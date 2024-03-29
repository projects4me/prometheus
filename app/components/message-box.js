/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import { once } from '@ember/runloop';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import $ from 'jquery';

/**
 * This component is used to render the quill editor in the application in order
 * to composer messages for the conversations
 *
 * @class MessageBox
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The comment that we are gathering
     *
     * @property comment
     * @type Ember.Service
     * @for MessageBox
     * @private
     */
    comment: null,

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for MessageBox
     * @private
     */
    i18n: inject(),

    /**
     * This is the list of emojis that we support
     *
     * @property emojiList
     * @type Array
     * @for MessageBoxComponent
     * @private
     */
    emojiList : [
        'grinning',
        'joy',
        'rolling-on-the-floor-laughing',
        'smile',
        'sweat-smile',
        'laughing',
        'wink',
        'blush',
        'yum',
        'smiling-face-with-sunglasses',
        'heart-eyes',
        'slightly-smiling-face',
        'thinking-face',
        'neutral-face',
        'expressionless',
        'no-mouth',
        'face-with-rolling-eyes',
        'smirk',
        'persevere',
        'disappointed-but-relieved-face',
        'open-mouth',
        'zipper-mouth-face',
        'hushed',
        'sleepy',
        'tired-face',
        'sleeping',
        'nerd-face',
        'stuck-out-tongue',
        'stuck-out-tongue-winking-eye',
        'drooling-face',
        'unamused',
        'sweat',
        'pensive',
        'confused',
        'upside-down-face',
        'money-mouth-face',
        'astonished',
        'slightly-frowning-face',
        'confounded',
        'disappointed',
        'worried',
        'triumph',
        'cry',
        'sob',
        'frowning-face',
        'fearful',
        'weary',
        'grimacing',
        'cold-sweat',
        'scream',
        'dizzy-face',
        'rage',
        'angry',
        'innocent',
        'face-with-cowboy-hat',
        'clown-face',
        'mask',
        'face-with-thermometer',
        'face-with-head-bandage',
        'nauseated-face',
        'sneezing-face',
        'smiling-imp',
        'skull',
        'alien',
        'v',
        'hand-with-index-and-middle-fingers-crossed-type-1-2',
        'ok-hand',
        'thumbsup',
        'thumbsdown',
        'clap',
        'zzz',
        'sunglasses',
        'ant',
        'hamburger',
        'pizza',
        'fries',
        'popcorn',
        'coffee',
        'first-place-medal',
        'second-place-medal',
        'third-place-medal',
        'military-medal',
        'checkered-flag',
        'skull-and-crossbones',
        'alarm-clock',
        'watch',
        'tada',
        'ribbon',
        'stopwatch',
        'bulb',
        'moneybag',
        'money-with-wings',
        'date',
        'chart-with-upwards-trend',
        'chart-with-downwards-trend',
        'anger',
        'no-entry',
        'no-entry-sign',
        'radioactive',
        'heavy-check-mark',
        'x',
        'bangbang',
        'interrobang',
        'question',
        'exclamation',
        '100',
    ],

    /**
     * These are the classes the must be registered with the component
     *
     * @property classNames
     * @type Array
     * @for MessageBox
     * @private
     */
    classNames: ["editable"],

    /**
     * These are the attributes that are bound with the element
     *
     * @property classNames
     * @type Array
     * @for MessageBox
     * @private
     */
    attributeBindings: ['contenteditable','spellcheck','placeholder'],

    /**
     * These are the translated emojis
     *
     * @property translatedEmojis
     * @type Array
     * @for MessageBox
     * @private
     */
    translatedEmojis: [],

    /**
     * Whether the content box is editable or not
     *
     * @property editable
     * @type boolean
     * @for MessageBoxComponent
     * @private
     */
    editable: true,

    /**
     * This flag is used to enable or disable spell checking
     *
     * @property checkSpelling
     * @type boolean
     * @for MessageBox
     * @private
     */
    checkSpelling: false,

    /**
     * Flag that maintains whether the user is typing or not
     *
     * @property isUserTyping
     * @type boolean
     * @for MessageBox
     * @private
     */
    isUserTyping: false,

    /**
     * This is the computed property that enables or disabled the HTML5 contenteditable
     * flag on the div
     *
     * @property contenteditable
     * @type Computed
     * @for MessageBox
     * @private
     */
    contenteditable: computed('editable', function() {
        let editable = this.editable;

        return editable ? 'true' : undefined;
    }),

    /**
     * This is the property that enables or disabled the HTML5 spellcheck flag on
     * the div
     *
     * @property spellcheck
     * @type Computed
     * @for MessageBox
     * @private
     */
    spellcheck: ('checkSpelling', function() {
        let spelling = this.checkSpelling;

        return spelling ? 'true' : 'false';
    }),

    /**
     * This function is used to observe the value and isUserTyping attributes
     *
     * @property valueObserver
     * @type function
     * @for MessageBox
     * @public
     */
    valueObserver: observer('value', 'isUserTyping', function() {
        once(this, 'processValue');
    }),

    /**
     * This function is called when the object is created, we are using this
     * function to translate the emojis
     *
     * @method init
     * @private
     */
    init(){
        this._super(...arguments);
        let self = this;

        let emojiList = $.map(this.emojiList, function(emoji) {
            return {'id':emoji, 'name':self.get('i18n').t('emoji.'+emoji)};
        });

        self.set('translatedEmojis',emojiList);
    },

    /**
     * This function is used to process the values
     *
     * @method processValue
     * @return {*|result}
     * @public
     */
    processValue() {
        if (!this.isUserTyping && this.value) {
            return this.setContents();
        }
    },

    /**
     * This function is an event handler that is called when the focus is removed from the div
     *
     * @method focusOut
     * @return {*}
     * @public
     */
    focusOut() {
        return this.set('isUserTyping', false);
    },

    /**
     * If the user is typing then set the flag to true
     *
     * @method keyDown
     * @param event {Object} the event that triggered this function
     * @public
     */
    keyDown(event) {
        if (!event.metaKey) {
            this.set('isUserTyping', true);
        }
    },

    /**
     * As soon as the user has typed in a key we update the value
     *
     * @method keyUp
     * @param event {Object} the event that triggered this function
     * @public
     */
    keyUp() {
        this.set('value', this.$().html());
    },

    /**
     * Return the contents set within this object
     *
     * @method setContents
     * @return result {Mixed} The current value
     * @public
     */
    setContents() {
        return this.value;
    },

    /**
     * Clear the contents
     *
     * @method clearContents
     * @public
     */
    clearContents() {
        this.set('value','');
        $(this.element).html('');
    },

    /**
     * Load the message box after it has been loaded
     *
     * @method didRender
     * @public
     * @todo get the base link for issues and users via a function.
     */
    didRender() {
        let self = this;

        // Add a listener for clearing the contents
        self.get('_target').on('clearContents', $.proxy(self.clearContents, self));

        // Setup the message box to load listen to the keyword @, # and :
        $('#'+this.elementId)
            .atwho({
                at: "@",
                data: self.get('usersList'),
                displayTpl: "<li>${name}</li>",
                insertTpl: "<a href='/app/users/${id}' class='${status}'>${atwho-at}${name}</a>"
            }).atwho({
            at: "#",
            data: self.get('issuesList'),
            displayTpl: "<li>${number} - ${name}</li>",
            searchKey: "number",
            insertTpl: "<a href='/app/${projectId}/issues/${id}' class='${status}'>${atwho-at}${number} - ${name}</a>"
        }).atwho({
            at: ':',
            displayTpl: "<li><i class='twa twa-${id}'></i> ${name} </li>",
            insertTpl: "<i class='twa twa-${id}'></i>",
            data: self.get('translatedEmojis')
        });

        return this.setContents();
    },

    /**
     * This function is called when the rendered component is being destroyed
     *
     * @method willDestroyElement
     * @public
     */
    willDestroyElement() {
        this._super(...arguments);
        $('#'+this.elementId).atwho('destroy');
    },

});
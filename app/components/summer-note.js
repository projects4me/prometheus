/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import $ from 'jquery';

/**
 * This is the wrapper component fo Summernote WYISWYG editor
 *
 * @class SummerNote
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 * @todo allow passing of the parameters to this component
 */
export default Component.extend({


    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for Prometheus.Components.SummerNote
     * @private
     */
    i18n: inject(),

    /**
     * This is the list of emojis that we support
     *
     * @property emojiList
     * @type Array
     * @for Prometheus.Components.SummerNote
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
     * These are the translated emojis
     *
     * @property translatedEmojis
     * @type Array
     * @for Prometheus.Components.SummerNote
     * @private
     */
    translatedEmojis: [],

    /**
     * This function is called when the object is created, we are using this
     * function to translate the emojis
     *
     * @method init
     * @private
     */
    init:function(){
        this._super(...arguments);
        let self = this;
        let emojiList = $.map(this.get('emojiList'), function(emoji) {
            return {'id':emoji, 'name':self.get('i18n').t('emoji.'+emoji)};
        });
        self.set('translatedEmojis',emojiList);
    },

    /**
     * This function is called by Ember when it is about to destroy the HTML elements rendered. We
     * use this function in order to destroy the javascript components
     *
     * @method willDestroyElement
     * @public
     */
    willDestroyElement() {
        this._super(...arguments);
        let self = this;
        this.$(self.element).summernote('destroy');
        //Logger.debug(this.editor);
        //this.editor = null;
        //this.$('.quill-editor').remove();
    },

    /**
     * Perform some actions after the render is complete
     *
     * @method didRender
     * @public
     * @todo perhaps delegate the did render per type
     */
    didInsertElement: function() {
        Logger.debug('Summernote::didRender');
        let self = this;
        Logger.debug(self);

        $(self.element).summernote({
            height: 350,
            minHeight: 350,
            maxHeight: 700,
            focus: true,
            callbacks: {
                onInit: function() {
                    $('.note-editable')
                        .atwho({
                            at: "@",
                            data: self.get('usersList'),
                            displayTpl: "<li>${label}</li>",
                            insertTpl: "<a href='/app/users/${value}' class='${status}'>${atwho-at}${label}</a>"
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

                    // hljs.configure({   // optionally configure hljs
                    //     languages: ['apache','javascript', 'ruby', 'python','php','java','html','sql','scss','less','json','coffeescript','cpp','go','htmlbars','handlebars','bash']
                    // });
                },
                onChange: function(contents, $editable) {
                    //Logger.debug('onChange:', contents, $editable);

                    self.sendAction('onContentChange',contents);
                }
            },
            prettifyHtml:false,
            toolbar:[

                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'clear', 'strikethrough', 'superscript', 'subscript']],
                ['fontsize', ['fontsize']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['height', ['height']],
                ['insert', ['picture','link','video','table','hr']],
                ['misc', ['undo','redo']],

            ],
            lang:'en-US',
        }); // End Summernote init

        let contents = this.get('contents');
        self.$(self.element).summernote('code', contents);
    },

});
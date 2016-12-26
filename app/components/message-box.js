import Ember from "ember";

/**
  This component is used to render the quill editor in the application in order
  to composer messages for the conversations

  @class MessageBoxComponent
  @module App.Components
  @namespace Prometheus
*/
export default Ember.Component.extend({

  comment: null,

  /**
   The i18n library service that is used in order to get the translations

   @property i18n
   @type Ember.Service
   @for Routes
   @public
  */
  i18n: Ember.inject.service(),

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

  classNames: ["message-box"],

  /**
    Load the message box after it has been loaded

    @todo perhaps delegate the did render per type
  */
  didRender: function() {
    var self = this;

    Logger.debug(this.get('i18n'));

    var emojiList = Ember.$.map(this.get('emojiList'), function(emoji) {
      return {'id':emoji, 'name':self.get('i18n').t('emoji.'+emoji)};
    });
    Logger.debug(emojiList);
    Ember.$('#'+this.elementId +' .editable')
      .atwho({
        at: "@",
        data: self.get('usersList'),
        displayTpl: "<li>${name}</li>",
        insertTpl: "${atwho-at}${name}"
      }).atwho({
        at: "#",
        data: self.get('issuesList'),
        displayTpl: "<li>${number} - ${name}</li>",
        insertTpl: "<a href='/app/${projectId}/issues/${id}' class='${status}'>#${number} - ${name}</a>"
      }).atwho({
        at: ':',
        displayTpl: "<li><i class='twa twa-${id}'></i> ${name} </li>",
        insertTpl: "<i class='twa twa-${id}'></i>",
        data: emojiList
      });
  },

  willDestroyElement() {
    this._super(...arguments);
    Ember.$('#'+this.elementId +' .editable').atwho('destroy');
  },

  actions:{
    saveComment:function(id){
      this.sendAction('save',id,this.get('comment'));
    },

    commentChanged:function(event){
      Logger.debug(event);
    }
  }
});

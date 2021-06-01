import Component from '@glimmer/component';
import $ from 'jquery';
import { inject as service } from '@ember/service';

export default class ToastUiComponent extends Component {
    /**
 * This is the list of emojis that we support
 *
 * @property emojiList
 * @type Array
 * @for Prometheus.Components.SummerNote
 * @private
 */
    emojiList = [
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
    ]

    translatedEmojis = [];

    @service i18n;

    constructor() {
        super(...arguments);
        let self = this;
        let emojiList = this.emojiList.map(emoji => {
            return {'id':emoji, 'name':String(self.i18n.t('emoji.'+emoji))};
        });
        self.translatedEmojis = emojiList;
    }
}

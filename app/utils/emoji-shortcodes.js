/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Emoticon shortcodes typed after the `:` trigger in the editor, keyed by emoji id (the ids of
 * `emojiList` in the toast-ui component). They are not translated.
 *
 * @class EmojiShortcodes
 * @namespace Prometheus.Utils
 * @module Utils.EmojiShortcodes
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
const SHORTCODES = {
    'grinning': ['D', '-D'],
    'smile': ['D', '-D'],
    'sweat-smile': [',D'],
    'laughing': ['>D'],
    'joy': ["')", "'D"],
    'wink': [';)', '-*'],
    'blush': ['3'],
    'heart-eyes': ['<3'],
    'slightly-smiling-face': [')', '-)'],
    'neutral-face': ['|', '-|'],
    'expressionless': ['-_-'],
    'unamused': ['/-'],
    'open-mouth': ['O', 'o', '-O'],
    'astonished': ['0'],
    'confused': ['/', '-/', '\\'],
    'slightly-frowning-face': ['(', '-('],
    'stuck-out-tongue': ['P', 'p', '-P'],
    'stuck-out-tongue-winking-eye': [';P'],
    'cry': ["'("],
    'sob': ["'(("],
    'angry': ['@'],
    'rage': ['@@'],
    'innocent': ['angel'],
    'sunglasses': ['B', '8)'],
    'smiling-face-with-sunglasses': ['B', '8)'],
    'zipper-mouth-face': ['x', 'X'],
    'sleeping': ['zz'],
    'scream': ['O_O'],
    'smiling-imp': ['>:)'],
    'skull': ['x_x'],
    'thumbsup': ['+1'],
    'thumbsdown': ['-1'],
    'ok-hand': ['ok'],
    'tada': ['party'],
    'question': ['?'],
    'exclamation': ['!'],
    '100': ['100']
};

/**
 * The number of emojis the menu offers
 *
 * @property MENU_LIMIT
 * @type Number
 */
export const MENU_LIMIT = 5;

export default class EmojiShortcodes {

    /**
     * Returns the shortcodes of an emoji
     *
     * @method for
     * @param {String} id The emoji id
     * @return {Array} The shortcodes, empty when the emoji has none
     * @static
     */
    static for(id) {
        return SHORTCODES[id] ?? [];
    }

    /**
     * Returns the emojis whose shortcode equals the query, in the order given
     *
     * @method search
     * @param {Array} emojis The translated emojis, each with `id` and `shortcodes`
     * @param {String} query The text typed after the trigger
     * @param {Number} limit The maximum number of results
     * @return {Array} The matching emojis
     * @static
     */
    static search(emojis, query, limit = MENU_LIMIT) {
        let text = (query ?? '').toLowerCase();
        if (text === '') {
            return emojis.filter(emoji => emoji.shortcodes?.length).slice(0, limit);
        }
        let exact = emojis.filter(emoji => emoji.shortcodes?.some(code => code.toLowerCase() === text));
        let prefix = emojis.filter(emoji => !exact.includes(emoji) && emoji.shortcodes?.some(code => code.toLowerCase().startsWith(text)));
        return exact.concat(prefix).slice(0, limit);
    }
}

import EmojiShortcodes from 'prometheus/utils/emoji-shortcodes';
import { module, test } from 'qunit';

module('Unit | Utility | emoji-shortcodes', function () {
    const emojis = [
        { id: 'a', shortcodes: ['D)'] },
        { id: 'b', shortcodes: ['D', '-D'] },
        { id: 'c', shortcodes: [] },
    ];

    test('exact shortcodes rank before prefix matches and names are not searched', function (assert) {
        assert.deepEqual(EmojiShortcodes.search(emojis, 'D').map(e => e.id), ['b', 'a']);
        assert.deepEqual(EmojiShortcodes.search(emojis, 'c'), []);
    });

    test('the result is limited', function (assert) {
        assert.strictEqual(EmojiShortcodes.search(emojis, 'D', 1).length, 1);
    });

    test('for returns an empty list for an unknown id', function (assert) {
        assert.deepEqual(EmojiShortcodes.for('nope'), []);
        assert.deepEqual(EmojiShortcodes.for('wink'), [';)', '-*']);
    });

    test('matching ignores case', function (assert) {
        assert.deepEqual(EmojiShortcodes.search(emojis, 'd').map(e => e.id), ['b', 'a']);
    });
});

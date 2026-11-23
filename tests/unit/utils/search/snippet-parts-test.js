/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import snippetParts from 'prometheus/utils/search/snippet-parts';

module('Unit | Utility | search/snippet-parts', function () {
    test('splits the matches out of the text', function (assert) {
        assert.deepEqual(snippetParts('the <mark>login</mark> page times <mark>out</mark>'), [
            { text: 'the ', match: false },
            { text: 'login', match: true },
            { text: ' page times ', match: false },
            { text: 'out', match: true }
        ]);
    });

    test('undoes Gaia escaping and drops the rich-text field tags', function (assert) {
        let parts = snippetParts('&lt;p&gt;a &amp;lt; b &lt;b&gt;<mark>bold</mark>&lt;/b&gt;&lt;/p&gt;');
        assert.deepEqual(parts, [
            { text: 'a < b ', match: false },
            { text: 'bold', match: true }
        ]);
    });

    test('a script in the record text stays text', function (assert) {
        let parts = snippetParts('&lt;img src=x onerror=alert(1)&gt;<mark>x</mark>');
        assert.deepEqual(parts, [{ text: 'x', match: true }], 'the tag is dropped, never rendered');
    });

    test('no snippet has no parts', function (assert) {
        assert.deepEqual(snippetParts(null), []);
        assert.deepEqual(snippetParts(''), []);
    });
});

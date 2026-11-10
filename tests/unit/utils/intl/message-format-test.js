/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { formatMessage } from 'prometheus/utils/intl/message-format';

module('Unit | Utility | intl/message-format', function () {
    test('plain text is returned as it is', function (assert) {
        assert.strictEqual(formatMessage('Hello world', {}, 'en-us'), 'Hello world');
        assert.strictEqual(formatMessage('', {}, 'en-us'), '');
    });

    test('it replaces simple arguments', function (assert) {
        assert.strictEqual(formatMessage('Hi {name}, you are {age}', { name: 'Ann', age: 7 }, 'en-us'), 'Hi Ann, you are 7');
        assert.strictEqual(formatMessage('[{ name }]', { name: 'x' }, 'en-us'), '[x]', 'spaces inside braces');
        assert.strictEqual(formatMessage('[{v}]', { v: null }, 'en-us'), '[]', 'null is empty');
        assert.strictEqual(formatMessage('[{v}]', { v: 0 }, 'en-us'), '[0]', 'zero is kept');
    });

    test('a missing argument throws', function (assert) {
        assert.throws(() => formatMessage('Hi {name}', {}, 'en-us'), /"name" was not provided/);
    });

    test('plural picks =N, then the plural category, then other', function (assert) {
        const message = '{count, plural, =0 {none} one {# item} other {# items}}';

        assert.strictEqual(formatMessage(message, { count: 0 }, 'en-us'), 'none');
        assert.strictEqual(formatMessage(message, { count: 1 }, 'en-us'), '1 item');
        assert.strictEqual(formatMessage(message, { count: 1234 }, 'en-us'), '1,234 items', '# is a formatted number');
    });

    test('plural offset shifts the category and #', function (assert) {
        const message = '{n, plural, offset:1 =0 {nobody} =1 {you} one {you and # other} other {you and # others}}';

        assert.strictEqual(formatMessage(message, { n: 0 }, 'en-us'), 'nobody');
        assert.strictEqual(formatMessage(message, { n: 1 }, 'en-us'), 'you');
        assert.strictEqual(formatMessage(message, { n: 2 }, 'en-us'), 'you and 1 other');
        assert.strictEqual(formatMessage(message, { n: 5 }, 'en-us'), 'you and 4 others');
    });

    test('select picks the matching option or other', function (assert) {
        const message = '{gender, select, male {He} female {She} other {They}} replied';

        assert.strictEqual(formatMessage(message, { gender: 'female' }, 'en-us'), 'She replied');
        assert.strictEqual(formatMessage(message, { gender: 'x' }, 'en-us'), 'They replied');
    });

    test('nested arguments render inside plural and select branches', function (assert) {
        const message = '{kind, select, user {{n, plural, one {# user named {name}} other {# users}}} other {-}}';

        assert.strictEqual(formatMessage(message, { kind: 'user', n: 1, name: 'Ann' }, 'en-us'), '1 user named Ann');
        assert.strictEqual(formatMessage(message, { kind: 'user', n: 3, name: 'Ann' }, 'en-us'), '3 users');
    });

    test('# outside a plural is plain text', function (assert) {
        assert.strictEqual(formatMessage('Issue #{id}', { id: 12 }, 'en-us'), 'Issue #12');
    });

    test('apostrophes follow ICU quoting', function (assert) {
        assert.strictEqual(formatMessage("It's {name}'s", { name: 'Ann' }, 'en-us'), "It's Ann's", 'a lone apostrophe is text');
        assert.strictEqual(formatMessage("a '' b", {}, 'en-us'), "a ' b", "'' is one apostrophe");
        assert.strictEqual(formatMessage("'{literal}' {x}", { x: 1 }, 'en-us'), '{literal} 1', 'quoted braces are literal');
        assert.strictEqual(
            formatMessage("{n, plural, other {'#' is #}}", { n: 3 }, 'en-us'),
            '# is 3',
            "'#' is a literal inside a plural"
        );
    });

    test('HTML tags are plain text', function (assert) {
        assert.strictEqual(formatMessage("<a href='x'>{label}</a>", { label: 'Go' }, 'en-us'), "<a href='x'>Go</a>");
    });

    test('plural rules follow the locale', function (assert) {
        const message = '{n, plural, one {one} few {few} many {many} other {other}}';

        assert.strictEqual(formatMessage(message, { n: 3 }, 'pl'), 'few');
        assert.strictEqual(formatMessage(message, { n: 5 }, 'pl'), 'many');
        assert.strictEqual(formatMessage(message, { n: 3 }, 'en-us'), 'other');
    });

    test('malformed messages throw', function (assert) {
        assert.throws(() => formatMessage('{n, number}', { n: 1 }, 'en-us'), /Unsupported argument type/);
        assert.throws(() => formatMessage('{n, plural, one {x}}', { n: 1 }, 'en-us'), /Missing "other"/);
        assert.throws(() => formatMessage('text }', {}, 'en-us'), /Unexpected/);
    });
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { initials, identity, COLORS, PATTERNS } from 'prometheus/utils/ui/avatar-identity';

module('Unit | Utility | ui/avatar-identity', function () {
    test('initials: first letter of the first and last word', function (assert) {
        assert.strictEqual(initials('ada lovelace', 'm'), 'AL');
        assert.strictEqual(initials('Ada Augusta King Lovelace', 'm'), 'AL');
        assert.strictEqual(initials('Plato', 'm'), 'P');
    });

    test('initials: extra spaces and empty names', function (assert) {
        assert.strictEqual(initials('  Ada   Lovelace  ', 'l'), 'AL');
        assert.strictEqual(initials('   ', 'm'), null);
        assert.strictEqual(initials('', 'm'), null);
        assert.strictEqual(initials(undefined, 'm'), null);
    });

    test('initials: non-Latin and astral characters', function (assert) {
        assert.strictEqual(initials('علي حسن', 'm'), 'عح');
        assert.strictEqual(initials('élan Ünal', 's'), 'ÉÜ');
        assert.strictEqual(initials('𠮷野 家', 'm'), '𠮷家');
    });

    test('initials: xs is always one letter', function (assert) {
        assert.strictEqual(initials('Ada Lovelace', 'xs'), 'A');
    });

    test('identity: the same key gives the same result', function (assert) {
        assert.deepEqual(identity(42), identity('42'));
        assert.deepEqual(identity('Ada'), identity('Ada'));
    });

    test('identity: indexes are valid and the accent never equals the base', function (assert) {
        for (let i = 0; i < 500; i++) {
            let { base, accent, pattern } = identity(i);
            assert.true(base >= 0, 'base');
            assert.true(base < COLORS.length, 'base');
            assert.true(accent >= 0, 'accent');
            assert.true(accent < COLORS.length, 'accent');
            assert.true(pattern >= 0, 'pattern');
            assert.true(pattern < PATTERNS.length, 'pattern');
            assert.notStrictEqual(accent, base);
        }
    });

    test('identity: different keys spread over the colours and patterns', function (assert) {
        let bases = new Set();
        let patterns = new Set();
        for (let i = 1; i <= 200; i++) {
            let { base, pattern } = identity(i);
            bases.add(base);
            patterns.add(pattern);
        }
        assert.strictEqual(bases.size, COLORS.length);
        assert.strictEqual(patterns.size, PATTERNS.length);
    });
});

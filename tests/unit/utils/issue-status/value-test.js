/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { STATUS_VALUE_MAX_LENGTH, toStatusValue } from 'prometheus/utils/issue-status/value';

module('Unit | Utility | issue-status/value', function () {
    test('it lowercases, turns spaces into _ and drops other characters', function (assert) {
        assert.strictEqual(toStatusValue('In Review 2!'), 'in_review_2');
        assert.strictEqual(toStatusValue('QA  Ready'), 'qa__ready');
        assert.strictEqual(toStatusValue('Prüfung-läuft'), 'prfungluft');
    });

    test('it keeps at most 30 characters', function (assert) {
        let value = toStatusValue('a'.repeat(40));
        assert.strictEqual(STATUS_VALUE_MAX_LENGTH, 30);
        assert.strictEqual(value, 'a'.repeat(30));
    });

    test('it turns nothing into an empty value', function (assert) {
        assert.strictEqual(toStatusValue(undefined), '');
        assert.strictEqual(toStatusValue('!!'), '');
    });
});

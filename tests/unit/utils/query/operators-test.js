/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { OPERATORS, byAlias, bySymbol, defaultFor, forType, isValidFor, operator } from 'prometheus/utils/query/operators';
import { setupTest } from 'ember-qunit';

module('Unit | Utility | query | operators', function (hooks) {
    setupTest(hooks);

    test('it covers every Gaia operator plus IN and NOT IN', function (assert) {
        let gaia = [':', '!:', '<', '<:', '>', '>:', 'CONTAINS', '!CONTAINS', 'STARTS', '!STARTS', 'ENDS', '!ENDS', 'BETWEEN', '!BETWEEN', 'NULL', '!NULL', 'EMPTY', '!EMPTY'];

        assert.deepEqual(gaia.filter((symbol) => !bySymbol(symbol)), [], 'every Gaia symbol has an operator');
        assert.strictEqual(operator('IN').symbol, 'CONTAINS');
        assert.strictEqual(operator('NOT IN').symbol, '!CONTAINS');
        assert.strictEqual(OPERATORS.length, 20);
    });

    test('every entry has a label, an arity and types', function (assert) {
        let intl = this.owner.lookup('service:intl');

        for (let op of OPERATORS) {
            assert.true(intl.exists(op.labelKey, 'en-us'), `${op.key} has an English label`);
            assert.ok([0, 1, 2, 'n'].includes(op.arity), `${op.key} has an arity`);
            assert.ok(op.types.length > 0, `${op.key} has types`);
        }

        assert.strictEqual(operator('NULL').arity, 0);
        assert.strictEqual(operator(':').arity, 1);
        assert.strictEqual(operator('BETWEEN').arity, 2);
        assert.strictEqual(operator('IN').arity, 'n');
    });

    test('bySymbol gives the scalar operator', function (assert) {
        assert.strictEqual(bySymbol('CONTAINS').key, 'CONTAINS', 'not IN');
        assert.strictEqual(bySymbol('!contains').key, '!CONTAINS');
        assert.strictEqual(bySymbol('>:').key, '>:');
        assert.strictEqual(bySymbol('='), undefined, 'an alias is not a symbol');
    });

    test('byAlias reads the typed aliases and keys without case', function (assert) {
        assert.strictEqual(byAlias('=').key, ':');
        assert.strictEqual(byAlias('!=').key, '!:');
        assert.strictEqual(byAlias('>=').key, '>:');
        assert.strictEqual(byAlias('<=').key, '<:');
        assert.strictEqual(byAlias('~').key, 'CONTAINS');
        assert.strictEqual(byAlias('in').key, 'IN');
        assert.strictEqual(byAlias(' In ').key, 'IN');
        assert.strictEqual(byAlias('not in').key, 'NOT IN');
        assert.strictEqual(byAlias('contains').key, 'CONTAINS');
        assert.strictEqual(byAlias('between').key, 'BETWEEN');
        assert.strictEqual(byAlias('?'), undefined);
        assert.strictEqual(byAlias(''), undefined);
    });

    test('the operators per type', function (assert) {
        let keys = (type) => forType(type).map((op) => op.key);

        assert.ok(keys('text').includes('CONTAINS'));
        assert.notOk(keys('text').includes('BETWEEN'));
        assert.ok(keys('date').includes('BETWEEN'));
        assert.notOk(keys('date').includes('STARTS'));
        assert.ok(keys('enum').includes('IN'));
        assert.notOk(keys('enum').includes('<'));
        assert.ok(keys('user').includes('NULL'));
        assert.ok(keys('number').includes('>:'));

        assert.true(isValidFor('IN', 'user'));
        assert.false(isValidFor('STARTS', 'number'));
        assert.false(isValidFor('??', 'text'));
    });

    test('the default operator per type', function (assert) {
        assert.strictEqual(defaultFor('text').key, 'CONTAINS');
        assert.strictEqual(defaultFor('enum').key, ':');
        assert.strictEqual(defaultFor('user').key, ':');
        assert.strictEqual(defaultFor('date').key, ':');
        assert.strictEqual(defaultFor('number').key, ':');
        assert.strictEqual(defaultFor('unknown').key, ':');
    });
});

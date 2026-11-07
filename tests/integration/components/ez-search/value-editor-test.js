/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';
import { operator } from 'prometheus/utils/query/operators';

const STATUS = {
    id: 'Issue.status',
    type: 'enum',
    values: [
        { value: 'a', label: 'Open' },
        { value: 'b', label: 'Closed' },
    ],
};

module('Integration | Component | ez-search/value-editor', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.emitted = [];
        this.onChange = (value) => this.emitted.push(value);
    });

    async function show(context, field, op, value = null) {
        context.setProperties({ field, operator: operator(op), value });
        await render(hbs`<EzSearch::ValueEditor @field={{this.field}} @operator={{this.operator}} @value={{this.value}} @onChange={{this.onChange}} />`);
    }

    test('arity 0 operators render no input', async function (assert) {
        await show(this, STATUS, 'NULL');
        assert.dom('[data-ez-value-editor]').doesNotExist();
    });

    test('text field renders a text input and emits a string', async function (assert) {
        await show(this, { id: 'Issue.subject', type: 'text' }, 'CONTAINS');
        assert.dom('[data-ez-value-editor="text"] input').exists();
        await fillIn('[data-ez-value-editor="text"] input', 'bug');
        assert.deepEqual(this.emitted.at(-1), 'bug');
    });

    test('number field renders a number input', async function (assert) {
        await show(this, { id: 'Issue.points', type: 'number' }, ':');
        assert.dom('[data-ez-value-editor="text"] input').hasAttribute('type', 'number');
    });

    test('IN on text field emits an array from comma separated text', async function (assert) {
        await show(this, { id: 'Issue.subject', type: 'text' }, 'IN');
        await fillIn('[data-ez-value-editor="csv"] input', 'a, b ,');
        assert.deepEqual(this.emitted.at(-1), ['a', 'b']);
    });

    test('enum field renders a select', async function (assert) {
        await show(this, STATUS, ':', 'b');
        assert.dom('[data-ez-value-editor="select"]').exists();
        assert.dom('[data-ez-value-editor="select"] .ember-power-select-selected-item').includesText('Closed');
    });

    test('enum IN renders a multi select and does not mutate the value', async function (assert) {
        let value = ['a'];
        await show(this, STATUS, 'IN', value);
        assert.dom('[data-ez-value-editor="list"]').exists();
        assert.dom('[data-ez-value-editor="list"] .ember-power-select-multiple-option').exists({ count: 1 });
        await click('[data-ez-value-editor="list"] .ember-power-select-trigger');
        await click(document.querySelectorAll('.ember-power-select-option')[1]);
        await settled();
        assert.deepEqual(this.emitted.at(-1), ['a', 'b']);
        assert.deepEqual(value, ['a']);
    });

    test('a single value shows as a one item array when switching to IN', async function (assert) {
        await show(this, STATUS, 'IN', 'a');
        assert.dom('[data-ez-value-editor="list"] .ember-power-select-multiple-option').exists({ count: 1 });
    });

    test('user field uses the user option template', async function (assert) {
        await show(this, { id: 'Issue.assignee', type: 'user', values: [{ value: 'u1', label: 'Sam' }] }, ':', 'u1');
        assert.dom('[data-ez-value-editor="select"] .relate-user .username').hasText('Sam');
    });

    test('number BETWEEN renders two number inputs and each emits [from, to] changing one end', async function (assert) {
        await show(this, { id: 'Issue.estimate', type: 'number' }, 'BETWEEN', ['1', '9']);
        assert.dom('[data-ez-value-editor="numrange"] input[type="number"]').exists({ count: 2 });
        await fillIn('[data-ez-value-editor="numrange"] .ez-search-range > :first-child input', '3');
        assert.deepEqual(this.emitted.at(-1), ['3', '9']);
        await fillIn('[data-ez-value-editor="numrange"] .ez-search-range > :last-child input', '7');
        assert.deepEqual(this.emitted.at(-1), ['1', '7']);
    });

    test('date field renders a date control; BETWEEN renders two',async function (assert) {
        await show(this, { id: 'Issue.startDate', type: 'date' }, ':');
        assert.dom('[data-ez-value-editor="date"] input').exists({ count: 1 });
        await show(this, { id: 'Issue.startDate', type: 'date' }, 'BETWEEN');
        assert.dom('[data-ez-value-editor="range"] input').exists({ count: 2 });
        assert.dom('[data-ez-value-editor="range"] .ez-search-range-and').hasText('and');
    });
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';
import { issueQuerySchema } from '../../../helpers/query-schema';
import { group, condition, isGroup } from 'prometheus/utils/query/ast';
import { serialize } from 'prometheus/utils/query/serializer';

function buildTree() {
    return group(
        'AND',
        [
            condition('Issue.status', 'IN', ['new', 'done'], 'c1'),
            condition('Issue.startDate', 'BETWEEN', ['2026-01-01', '2026-01-31'], 'c2'),
            condition('assignedTo.name', ':', null, 'c3'),
            group('OR', [condition('issuetype.name', ':', 'Bug', 'c4'), condition('issuetype.name', ':', 'Task', 'c5')], 'g2'),
        ],
        'g1'
    );
}

module('Integration | Component | ez-search/panel', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.schema = issueQuerySchema();
        this.emitted = [];
        this.onChange = (tree) => this.emitted.push(tree);
        this.tree = buildTree();
    });

    async function show() {
        await render(hbs`<EzSearch::Panel @tree={{this.tree}} @schema={{this.schema}} @onChange={{this.onChange}} />`);
    }

    test('an empty tree shows one empty AND group', async function (assert) {
        this.tree = null;
        await show(this);
        assert.dom('[data-ez-group]').exists({ count: 1 });
        assert.dom('[data-ez-group="AND"]').exists();
        assert.dom('[data-ez-condition]').doesNotExist();
        assert.dom('[data-ez-remove-group]').doesNotExist();
    });

    test('renders the builder tree', async function (assert) {
        await show(this);
        assert.dom('[data-ez-group="AND"]').exists({ count: 1 });
        assert.dom('[data-ez-group="OR"]').exists({ count: 1 });
        assert.dom('[data-ez-condition]').exists({ count: 5 });
        assert.dom('[data-ez-group="OR"] [data-ez-condition]').exists({ count: 2 });
        assert.dom('[data-ez-incomplete]').exists({ count: 1 });
        assert.dom('[data-ez-condition="c3"] [data-ez-incomplete]').exists();
        assert.dom('[data-ez-condition="c2"] [data-ez-value-editor="range"]').exists();
    });

    test('the incomplete row is in the tree and out of the query', async function (assert) {
        await show(this);
        assert.ok(this.tree.children.some((child) => child.id === 'c3'));
        assert.notOk(serialize(this.tree).query.includes('assignedTo'));
    });

    test('toggling the conjunction emits the new tree', async function (assert) {
        await show(this);
        await click('[data-ez-group="OR"] [data-ez-conjunction="AND"]');
        let tree = this.emitted.at(-1);

        assert.strictEqual(tree.children[3].conjunction, 'AND');
        assert.strictEqual(tree.conjunction, 'AND');
        assert.strictEqual(this.tree.children[3].conjunction, 'OR', '@tree is not mutated');
    });

    test('adding a condition and a group', async function (assert) {
        this.tree = group('AND', [], 'g1');
        await show(this);
        await click('[data-ez-add-condition]');
        let tree = this.emitted.at(-1);

        assert.strictEqual(tree.children.length, 1);
        assert.strictEqual(tree.children[0].kind, 'condition');

        await click('[data-ez-add-group]');
        let withGroup = this.emitted.at(-1);

        assert.ok(isGroup(withGroup.children[0]));
    });

    test('removing a condition and a group', async function (assert) {
        await show(this);
        await click('[data-ez-condition="c1"] [data-ez-remove-condition]');
        assert.deepEqual(
            this.emitted.at(-1).children.map((child) => child.id),
            ['c2', 'c3', 'g2']
        );

        await click('[data-ez-group="OR"] [data-ez-remove-group]');
        assert.deepEqual(
            this.emitted.at(-1).children.map((child) => child.id),
            ['c1', 'c2', 'c3']
        );
    });

    test('changing the field resets the operator and clears the value', async function (assert) {
        await show(this);
        await click('[data-ez-condition="c1"] [data-field="ez-search.condition.field"] .ember-power-select-trigger');
        let options = [...document.querySelectorAll('.ember-power-select-option')];
        let subject = options.find((option) => option.textContent.trim() === 'Subject');

        await click(subject);
        let changed = this.emitted.at(-1).children[0];

        assert.strictEqual(changed.id, 'c1');
        assert.strictEqual(changed.field, 'Issue.subject');
        assert.strictEqual(changed.operator, 'CONTAINS');
        assert.strictEqual(changed.value, null);
    });

    test('a value with a bracket shows the refusal', async function (assert) {
        this.tree = group('AND', [condition('Issue.subject', 'CONTAINS', 'a(b', 'c1')], 'g1');
        await show(this);
        assert.dom('[data-ez-condition="c1"] [data-ez-error]').exists();
        assert.dom('[data-ez-condition="c1"] [data-ez-incomplete]').doesNotExist();
    });

    test('typing a value emits it', async function (assert) {
        this.tree = group('AND', [condition('Issue.subject', 'CONTAINS', null, 'c1')], 'g1');
        await show(this);
        await fillIn('[data-ez-condition="c1"] [data-ez-value-editor="text"] input', 'bug');
        assert.strictEqual(this.emitted.at(-1).children[0].value, 'bug');
    });
});

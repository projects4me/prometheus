/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { issueQuerySchema } from '../../../helpers/query-schema';
import { group, condition } from 'prometheus/utils/query/ast';

function buildTree() {
    return group(
        'AND',
        [
            condition('Issue.subject', 'CONTAINS', 'search', 'c1'),
            condition('Issue.status', ':', 'new', 'c2'),
            condition('Issue.status', 'IN', ['new', 'done'], 'c3'),
            condition('Issue.startDate', 'BETWEEN', ['2026-05-01', '2026-08-31'], 'c4'),
            condition('assignedTo.name', ':', null, 'c5'),
            group('OR', [condition('issuetype.name', ':', 'Bug', 'c6'), condition('Issue.priority', ':', 'High', 'c7')], 'g2'),
        ],
        'g1'
    );
}

module('Integration | Component | ez-search/applied-filters', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.schema = issueQuerySchema();
        this.emitted = [];
        this.onChange = (tree) => this.emitted.push(tree);
        this.tree = buildTree();
    });

    async function show() {
        await render(hbs`<EzSearch::AppliedFilters @tree={{this.tree}} @schema={{this.schema}} @onChange={{this.onChange}} />`);
    }

    test('renders a chip per complete condition and group', async function (assert) {
        await show();
        assert.dom('[data-ez-chip]').exists({ count: 5 });
        assert.dom('[data-ez-chip="c1"]').hasText('Subject contains: search');
        assert.dom('[data-ez-chip="c2"]').hasText('Status: New');
        assert.dom('[data-ez-chip="c3"]').hasText('Status is any of: New, Done');
        assert.dom('[data-ez-chip="c4"]').hasText('Start date between: 2026-05-01 and 2026-08-31');
        assert.dom('[data-ez-chip="g2"]').hasText('Any of: Type: Bug, Priority: High');
        assert.dom('[data-ez-chip="c2"] strong').hasText('New');
        assert.dom('[data-ez-chip="c2"] .fa-times').exists();
    });

    test('incomplete conditions get no chip', async function (assert) {
        await show();
        assert.dom('[data-ez-chip="c5"]').doesNotExist();
    });

    test('the title carries the full text', async function (assert) {
        await show();
        assert.dom('[data-ez-chip="c1"]').hasAttribute('title', 'Subject contains: search');
    });

    test('values render as text, not html', async function (assert) {
        this.tree = group('AND', [condition('Issue.subject', 'CONTAINS', '<b>x</b>', 'c1')], 'g1');
        await show();
        assert.dom('[data-ez-chip="c1"] b').doesNotExist();
        assert.dom('[data-ez-chip="c1"]').hasText('Subject contains: <b>x</b>');
    });

    test('removing each chip emits the tree without it', async function (assert) {
        await show();

        for (let id of ['c1', 'c2', 'c3', 'c4', 'g2']) {
            await click(`[data-ez-chip="${id}"]`);
        }

        let removed = (tree) => tree.children.map((child) => child.id);

        assert.deepEqual(removed(this.emitted[0]), ['c2', 'c3', 'c4', 'c5', 'g2']);
        assert.deepEqual(removed(this.emitted[1]), ['c1', 'c3', 'c4', 'c5', 'g2']);
        assert.deepEqual(removed(this.emitted[2]), ['c1', 'c2', 'c4', 'c5', 'g2']);
        assert.deepEqual(removed(this.emitted[3]), ['c1', 'c2', 'c3', 'c5', 'g2']);
        assert.deepEqual(removed(this.emitted[4]), ['c1', 'c2', 'c3', 'c4', 'c5']);
    });

    test('an empty tree renders nothing', async function (assert) {
        this.tree = null;
        await show();
        assert.dom('[data-ez-chips]').doesNotExist();
    });
});

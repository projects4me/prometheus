/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, focus, blur, waitUntil, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import jQuery from 'jquery';
import AclStub from '../../stub-services/acl-stub';
import { issueQuerySchema } from '../../../helpers/query-schema';

const INPUT = '[data-field="ez-search-input"] input, input[data-field="ez-search-input"]';
const DONE = '((Issue.status : done))';
const TWO = '((Issue.status : done) AND (Issue.priority : high))';

module('Integration | Component | ez-search-compact', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.schema = issueQuerySchema();
        this.applied = [];
        this.onApply = (query) => this.applied.push(query);
        this.saved = [{ id: 's1', name: 'Done ones', query: DONE }];
        this.query = '';
        this.linear = false;
        this.saves = [];
        this.updates = [];
        this.changes = [];
        this.onSave = (query) => this.saves.push(query);
        this.onUpdate = (search, query) => this.updates.push([search.id, query]);
        this.onChange = (search) => this.changes.push(search && search.id);
    });

    hooks.afterEach(function () {
        jQuery('.modal-backdrop').remove();
        jQuery('body').removeClass('modal-open');
    });

    async function show(full = false) {
        if (full) {
            await render(hbs`<EzSearch @schema={{this.schema}} @query={{this.query}} @savedSearches={{this.saved}}
              @onApply={{this.onApply}} @onSave={{this.onSave}} @onUpdateSavedSearch={{this.onUpdate}}
              @onSavedSearchChange={{this.onChange}} @aclContext="issue.read" />`);
        } else {
            await render(hbs`<EzSearchCompact @schema={{this.schema}} @query={{this.query}} @savedSearches={{this.saved}}
              @onApply={{this.onApply}} @onSave={{this.onSave}} @onUpdateSavedSearch={{this.onUpdate}}
              @onSavedSearchChange={{this.onChange}} @aclContext="issue.read" @linear={{this.linear}} />`);
        }
    }

    async function scenario(context, full) {
        context.applied = [];
        context.saves = [];
        context.updates = [];
        context.changes = [];
        await show(full);
        await click('[data-ez-search-apply]');
        await click('.app-dropdown-btn');
        await click('[data-ez-saved-item]');
        await focus(INPUT);
        await fillIn(INPUT, TWO);
        await blur(INPUT);
        await click('.app-dropdown-btn');
        await click('[data-ez-saved-update]');
        await focus(INPUT);
        await fillIn(INPUT, DONE);
        await blur(INPUT);
        await click('.app-dropdown-btn');
        await click('[data-ez-saved-save-new]');
        await click('[data-ez-search-clear]');

        return {
            applied: [...context.applied],
            saves: [...context.saves],
            updates: [...context.updates],
            changes: [...context.changes],
        };
    }

    for (const full of [false, true]) {
        test(`a focused saved item is highlighted (${full ? 'EzSearch' : 'EzSearchCompact'})`, async function (assert) {
            await show(full);
            await click('.app-dropdown-btn');
            const item = this.element.querySelector('[data-ez-saved-item]');
            item.focus();
            const style = getComputedStyle(item);
            assert.notEqual(style.backgroundColor, 'rgba(0, 0, 0, 0)', 'has a background');
            assert.strictEqual(style.color, 'rgb(255, 255, 255)', 'white text');
        });
    }

    test('it takes the same arguments as EzSearch and gives the same callbacks', async function (assert) {
        const full = await scenario(this, true);
        const compact = await scenario(this, false);

        assert.ok(full.applied.length >= 4, 'the scenario applied');
        assert.deepEqual(compact, full);
    });

    test('multi-row: the bar row, the Saved and Filter row and the chips row', async function (assert) {
        this.query = TWO;
        await show();

        const top = (selector) => document.querySelector(selector).getBoundingClientRect().top;
        assert.dom('[data-ez-filter-count]').hasText('2');
        assert.dom('[data-ez-chip]').exists({ count: 2 });
        assert.ok(Math.abs(top('[data-ez-search-bar]') - top('[data-ez-search-apply]')) <= 4, 'bar and Search share row 1');
        assert.ok(Math.abs(top('[data-ez-search-apply]') - top('[data-ez-search-clear]')) <= 4, 'Search and Clear share row 1');
        assert.ok(top('[data-ez-saved]') > top('[data-ez-search-bar]') + 10, 'Saved is below the bar');
        assert.ok(Math.abs(top('[data-ez-saved]') - top('[data-ez-builder-toggle]')) <= 4, 'Saved and Filter share row 2');
        assert.ok(top('[data-ez-chips]') > top('[data-ez-saved]') + 10, 'the chips are on row 3');
        assert.dom('[data-ez-saved] .fa-bookmark-o').exists();
    });

    test('no badge or chips without conditions; Search and Clear apply', async function (assert) {
        this.query = DONE;
        await show();
        await click('[data-ez-search-apply]');
        assert.deepEqual(this.applied, [DONE]);

        await click('[data-ez-search-clear]');
        assert.strictEqual(this.applied.length, 2);
        assert.dom('[data-ez-filter-count]').doesNotExist();
        assert.dom('[data-ez-chip]').doesNotExist();
    });

    test('removing a chip applies at once', async function (assert) {
        this.query = TWO;
        await show();
        await click('[data-ez-chip]');

        assert.strictEqual(this.applied.length, 1);
        assert.dom('[data-ez-chip]').exists({ count: 1 });
        assert.dom('[data-ez-filter-count]').hasText('1');
    });

    test('the active saved search shows its name', async function (assert) {
        await show();
        await click('.app-dropdown-btn');
        await click('[data-ez-saved-item]');

        assert.dom('[data-ez-saved] .fa-bookmark').exists();
        assert.dom('[data-ez-saved-name]').hasText('Done ones');
        assert.dom('[data-ez-saved-edited]').doesNotExist();
    });

    test('Save current search hands the query to @onSave', async function (assert) {
        this.query = DONE;
        await show();
        await click('.app-dropdown-btn');
        await click('[data-ez-save]');

        assert.deepEqual(this.saves, [DONE]);
    });

    test('multi-row: Search and Clear are icon-only buttons attached to the bar', async function (assert) {
        await render(hbs`<div style="width: 300px"><EzSearchCompact @schema={{this.schema}} @query={{this.query}}
          @savedSearches={{this.saved}} @onApply={{this.onApply}} @aclContext="issue.read" /></div>`);

        const search = document.querySelector('[data-ez-search-apply]');
        const clear = document.querySelector('[data-ez-search-clear]');
        const input = document.querySelector('[data-ez-search-bar]');
        assert.strictEqual(search.textContent.trim(), '', 'Search has no text');
        assert.strictEqual(clear.textContent.trim(), '', 'Clear has no text');
        assert.dom('i.fa-search', search).exists();
        assert.dom('i.fa-times', clear).exists();
        assert.dom(search).hasAttribute('title');
        assert.dom(clear).hasAttribute('aria-label');
        assert.ok(Math.abs(input.getBoundingClientRect().top - search.getBoundingClientRect().top) <= 4, 'on the bar row');
        const buttons = search.getBoundingClientRect().width + clear.getBoundingClientRect().width;
        assert.ok(input.getBoundingClientRect().width > buttons, 'the input is wider than both buttons');
    });

    test('linear: one row without chips', async function (assert) {
        this.linear = true;
        this.query = DONE;
        await show();

        const top = (selector) => document.querySelector(selector).getBoundingClientRect().top;
        ['[data-ez-saved]', '[data-ez-builder-toggle]', '[data-ez-search-apply]', '[data-ez-search-clear]'].forEach((selector) =>
            assert.ok(Math.abs(top(selector) - top('[data-ez-search-bar]')) <= 4, `${selector} shares the row of the bar`)
        );
        assert.dom('[data-ez-chips]').doesNotExist();
        assert.dom('[data-ez-search-apply]').hasAttribute('title');
    });

    test('the modal applies on Search', async function (assert) {
        await show();
        await click('[data-ez-builder-toggle]');
        assert.dom('.modal [data-ez-panel]').exists();

        await click('.modal [data-ez-add-condition]');
        assert.dom('.modal [data-ez-condition]').exists();
        await click('.modal [data-btn="save"]');
        await waitUntil(() => !document.querySelector('.modal'));

        assert.strictEqual(this.applied.length, 1);
    });

    test('the modal discards on Cancel', async function (assert) {
        this.query = DONE;
        await show();
        await click('[data-ez-builder-toggle]');
        await click('.modal [data-ez-remove-condition]');
        assert.dom('.modal [data-ez-condition]').doesNotExist();
        await click('.modal [data-btn="cancel"]');
        await waitUntil(() => !document.querySelector('.modal'));
        await settled();

        assert.strictEqual(this.applied.length, 0);
        assert.dom(INPUT).hasValue(DONE);
        assert.dom('[data-ez-filter-count]').hasText('1');
    });

    test('the modal Clear empties the query and applies', async function (assert) {
        this.query = DONE;
        await show();
        await click('[data-ez-builder-toggle]');
        await click('.modal [data-btn="left"]');
        await waitUntil(() => !document.querySelector('.modal'));

        assert.strictEqual(this.applied.length, 1);
        assert.dom(INPUT).hasValue('');
    });
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const LIST = hbs`
  <QuickList @title="Ideas" @items={{this.items}} @total={{this.total}} @page={{this.page}} @limit={{this.limit}}
             @onPage={{this.onPage}} @isLoading={{this.isLoading}}
             @groupOptions={{this.groupOptions}} @groupBy={{this.groupBy}} @onGroup={{this.onGroup}}
             @sortOptions={{this.sortOptions}} @sort={{this.sort}} @order={{this.order}} @onSort={{this.onSort}}
             @selectable={{this.selectable}} @onSelect={{this.onSelect}}>
    <:item as |record Item|>
      <Item><:primary><span data-test-name>{{record.name}}</span></:primary></Item>
    </:item>
    <:group as |group|><b data-test-custom-heading>{{group.label}}!</b></:group>
    <:selectionActions as |selected clear|>
      <button type="button" data-test-bulk>{{selected.length}}</button>
      <button type="button" data-test-bulk-clear {{on "click" clear}}>x</button>
    </:selectionActions>
  </QuickList>
`;

module('Integration | Component | quick-list assembly', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.items = [
            { id: '1', name: 'A', status: 'new' },
            { id: '2', name: 'B', status: 'done' },
            { id: '3', name: 'C', status: 'new' },
        ];
        this.total = 30;
        this.page = 2;
        this.limit = 10;
        this.calls = [];
        this.onPage = (p) => this.calls.push(['page', p]);
        this.onGroup = (k) => this.calls.push(['group', k]);
        this.onSort = (k, o) => this.calls.push(['sort', k, o]);
        this.onSelect = (ids) => this.calls.push(['select', ids]);
        this.groupOptions = [{ key: 'status', label: 'Status', groupKey: (r) => r.status, groupLabel: (k) => k.toUpperCase() }];
        this.sortOptions = [{ key: 'name', label: 'Name' }];
        this.sort = 'name';
        this.order = 'asc';
    });

    test('pagination reports the page and is disabled while loading', async function (assert) {
        await render(LIST);
        assert.dom('[data-quick-list-pagination-range]').hasText('11-20 / 30');
        await click('[data-quick-list-pagination-next]');
        assert.deepEqual(this.calls, [['page', 3]]);

        this.set('isLoading', true);
        assert.dom('[data-quick-list-pagination-next]').isDisabled();
    });

    test('no pagination without @onPage and no toolbar without options', async function (assert) {
        this.set('onPage', undefined);
        this.set('groupOptions', undefined);
        this.set('sortOptions', undefined);
        await render(LIST);
        assert.dom('[data-quick-list-pagination]').doesNotExist();
        assert.dom('.quick-list-toolbar').doesNotExist();
    });

    test('group and sort callbacks fire from the toolbar', async function (assert) {
        await render(LIST);
        await click('.quick-list-toolbar-group button');
        await click('[data-test-group-option="status"]');
        await click('.quick-list-toolbar-sort button');
        await click('[data-test-sort-option="name"]');
        assert.deepEqual(this.calls, [['group', 'status'], ['sort', 'name', 'desc']]);
    });

    test('grouped rendering shows counts, the group block, and remembers collapse per groupBy', async function (assert) {
        this.set('groupBy', 'status');
        await render(LIST);
        assert.dom('[data-test-quick-list-group]').exists({ count: 2 });
        assert.dom('[data-test-quick-list-group="new"] [data-test-quick-list-group-count]').hasText('2');
        assert.dom('[data-test-custom-heading]').exists({ count: 2 });
        assert.dom('[data-test-quick-list-group="new"] [data-test-custom-heading]').hasText('NEW!');

        await click('[data-test-quick-list-group="new"] [data-test-quick-list-group-toggle]');
        assert.dom('[data-test-quick-list-group="new"] [data-test-name]').doesNotExist();
        assert.dom('[data-test-quick-list-group="done"] [data-test-name]').exists();

        this.set('groupBy', undefined);
        assert.dom('[data-test-name]').exists({ count: 3 });
        this.set('groupBy', 'status');
        assert.dom('[data-test-quick-list-group="new"] [data-test-name]').doesNotExist('collapse is remembered');
    });

    test('selection: rows, select-all states, bar swap, yielded actions and clearing', async function (assert) {
        this.set('selectable', true);
        await render(LIST);
        assert.dom('[data-test-quick-list-check]').exists({ count: 3 });
        assert.dom('[data-quick-list-select-all]').hasAttribute('data-state', 'none');
        assert.dom('[data-quick-list-selection]').doesNotExist();

        await click('[data-test-quick-list-check]');
        assert.deepEqual(this.calls.pop(), ['select', ['1']]);
        assert.dom('[data-test-quick-list-check] .fa-check-square').exists();
        assert.dom('.quick-list__row--selected').exists({ count: 1 });
        assert.dom('[data-quick-list-selection]').exists('bar replaces the toolbar');
        assert.dom('.quick-list-toolbar').doesNotExist();
        assert.dom('[data-quick-list-selection] [data-quick-list-select-all]').hasAttribute('data-state', 'some');
        assert.dom('[data-test-bulk]').hasText('1');

        await click('[data-quick-list-selection] [data-quick-list-select-all]');
        assert.deepEqual(this.calls.pop(), ['select', ['1', '2', '3']]);
        assert.dom('[data-quick-list-select-all]').hasAttribute('data-state', 'all');

        await click('[data-test-bulk-clear]');
        assert.deepEqual(this.calls.pop(), ['select', []]);
        assert.dom('[data-quick-list-selection]').doesNotExist();
        assert.dom('.quick-list-toolbar').exists();
    });

    test('selection is cleared when the items change', async function (assert) {
        this.set('selectable', true);
        await render(LIST);
        await click('[data-test-quick-list-check]');
        assert.dom('[data-quick-list-selection]').exists();

        this.set('items', [{ id: '9', name: 'Z', status: 'new' }]);
        await settled();
        assert.dom('[data-quick-list-selection]').doesNotExist();
        assert.dom('.quick-list__row--selected').doesNotExist();
        assert.deepEqual(this.calls.pop(), ['select', []]);
    });
});

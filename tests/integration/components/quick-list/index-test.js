/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const LIST = hbs`
  <QuickList @title="Ideas" @items={{this.items}} @total={{this.total}} @activeId={{this.activeId}}
             @isLoading={{this.isLoading}} @error={{this.error}} @onRetry={{this.onRetry}}
             @onClearSearch={{this.onClearSearch}}>
    <:actions><button type="button" class="btn btn-box-tool" data-test-add>Add</button></:actions>
    <:search><input type="text" data-test-search /></:search>
    <:item as |record Item|>
      <Item @route="app.user.page" @model={{record.id}}>
        <:primary>
          <span data-test-name>{{record.name}}</span>
          <span class="label new" data-test-status>{{record.status}}</span>
        </:primary>
        <:secondary><span data-test-owner>{{record.owner}}</span></:secondary>
      </Item>
    </:item>
  </QuickList>
`;

module('Integration | Component | quick-list', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.setupRouter();
        this.items = [
            { id: '1', name: 'First idea', status: 'new', owner: 'Ann' },
            { id: '2', name: 'Second idea', status: 'done', owner: 'Bob' },
        ];
        this.total = undefined;
        this.activeId = undefined;
        this.isLoading = false;
        this.error = null;
        this.onRetry = undefined;
        this.onClearSearch = undefined;
    });

    test('it renders the box, header, slots and items through the named blocks', async function (assert) {
        await render(LIST);

        assert.dom('.quick-list').hasClass('box').hasClass('box-primary');
        assert.dom('[data-test-quick-list-header] .box-title').includesText('Ideas');
        assert.dom('[data-test-quick-list-count]').hasText('2');
        assert.dom('[data-test-quick-list-actions] [data-test-add]').exists('actions render in box-tools');
        assert.dom('.quick-list > [data-test-search]').exists('search slot is rendered without a wrapper');
        assert.dom('[data-test-quick-list-item]').exists({ count: 2 });
        assert.dom('[data-test-quick-list-item] [data-test-quick-list-item-primary] [data-test-name]').hasText('First idea');
        assert.dom('[data-test-quick-list-item-primary] [data-test-status]').hasText('new');
        assert.dom('[data-test-quick-list-item-secondary] [data-test-owner]').hasText('Ann');
        assert.dom('a[data-test-quick-list-item]').hasAttribute('href', /1$/, 'rows link through @route/@model');
        assert.dom('.quick-list-item--active').doesNotExist();
    });

    test('it shows the count of the total when they differ', async function (assert) {
        this.total = 64;
        await render(LIST);
        assert.dom('[data-test-quick-list-count]').hasText('2 of 64');

        this.set('items', []);
        assert.dom('[data-test-quick-list-count]').hasText('0 of 64');

        this.set('total', 0);
        assert.dom('[data-test-quick-list-count]').hasText('0');
    });

    test('without a total a next page reads count+ in the header', async function (assert) {
        this.hasNext = true;
        this.noop = () => {};
        await render(hbs`<QuickList @title="Ideas" @items={{this.items}} @page={{1}} @limit={{2}} @hasNext={{this.hasNext}} @onPage={{this.noop}} />`);
        assert.dom('[data-test-quick-list-count]').hasText('2+');
        assert.dom('[data-quick-list-pagination-range]').hasText('1-2 / 2+');
        assert.dom('[data-quick-list-pagination-next]').isNotDisabled();
    });

    test('it marks the active item', async function (assert) {
        this.activeId = 2;
        await render(LIST);

        assert.dom('.quick-list-item--active').exists({ count: 1 });
        assert.dom('.quick-list-item--active [data-test-name]').hasText('Second idea');

        this.set('activeId', '1');
        assert.dom('.quick-list-item--active [data-test-name]').hasText('First idea');
    });

    test('it shows three skeleton rows while loading', async function (assert) {
        this.isLoading = true;
        await render(LIST);

        assert.dom('[data-test-quick-list-skeleton]').exists({ count: 3 });
        assert.dom('[data-test-quick-list-skeleton] .skeleton-line').exists();
        assert.dom('[data-test-quick-list-item]').doesNotExist();
        assert.dom('[data-test-quick-list-count]').doesNotExist();
    });

    test('it shows the default empty state with a working clear-search action', async function (assert) {
        this.items = [];
        await render(LIST);

        assert.dom('[data-test-quick-list-empty]').includesText('No records found.');
        assert.dom('[data-test-quick-list-empty] .fa-info-circle').exists();
        assert.dom('[data-test-quick-list-clear-search]').doesNotExist('no action without @onClearSearch');

        let cleared = 0;
        this.set('onClearSearch', () => cleared++);
        await click('[data-test-quick-list-clear-search]');
        assert.dom('[data-test-quick-list-clear-search]').hasText('Clear the search');
        assert.strictEqual(cleared, 1, '@onClearSearch is called');
    });

    test('it renders a replaced empty state', async function (assert) {
        this.items = [];
        await render(hbs`
          <QuickList @title="Ideas" @items={{this.items}}>
            <:empty><p data-test-custom-empty>Nothing here yet</p></:empty>
          </QuickList>
        `);

        assert.dom('[data-test-custom-empty]').hasText('Nothing here yet');
        assert.dom('[data-test-quick-list-empty]').doesNotExist();
    });

    test('it shows the error state with a working retry action', async function (assert) {
        this.error = new Error('boom');
        await render(LIST);

        assert.dom('[data-test-quick-list-error]').includesText('The list could not be loaded.');
        assert.dom('[data-test-quick-list-error] .fa-exclamation-triangle').exists();
        assert.dom('[data-test-quick-list-item]').doesNotExist();
        assert.dom('[data-test-quick-list-retry]').doesNotExist('no action without @onRetry');

        let retried = 0;
        this.set('onRetry', () => retried++);
        assert.dom('[data-test-quick-list-retry]').hasText('Try again');
        await click('[data-test-quick-list-retry]');
        assert.strictEqual(retried, 1, '@onRetry is called');
    });

    test('an item without a route is not a link', async function (assert) {
        await render(hbs`
          <QuickList::Item @isActive={{true}}>
            <:primary>Plain</:primary>
          </QuickList::Item>
        `);

        assert.dom('div[data-test-quick-list-item]').hasClass('quick-list-item--active');
        assert.dom('[data-test-quick-list-item-primary]').hasText('Plain');
        assert.dom('[data-test-quick-list-item-secondary]').doesNotExist();
    });
});

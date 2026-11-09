/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | quick-list/item', function (hooks) {
    setupRenderingTest(hooks);

    test('a row with a leading block renders the leading column before the body', async function (assert) {
        await render(hbs`
          <QuickList::Item>
            <:leading><span data-test-initials>AL</span></:leading>
            <:primary><span>Login form</span></:primary>
            <:secondary>Ada Lovelace</:secondary>
          </QuickList::Item>
        `);

        let item = this.element.querySelector('[data-test-quick-list-item]');
        assert.dom(item).hasClass('quick-list-item--with-leading');
        let children = Array.from(item.children);
        assert.strictEqual(children.length, 2, 'the row holds the leading column and the body');
        assert.dom(children[0]).hasAttribute('data-test-quick-list-item-leading');
        assert.dom(children[1]).hasAttribute('data-test-quick-list-item-body');
        assert.dom('[data-test-quick-list-item-leading] [data-test-initials]').hasText('AL');
        assert.dom('[data-test-quick-list-item-body] [data-test-quick-list-item-primary]').hasText('Login form');
        assert.dom('[data-test-quick-list-item-body] [data-test-quick-list-item-secondary]').hasText('Ada Lovelace');
    });

    test('a row without a leading block is unchanged', async function (assert) {
        await render(hbs`
          <QuickList::Item>
            <:primary><span>Login form</span></:primary>
            <:secondary>Ada Lovelace</:secondary>
          </QuickList::Item>
        `);

        let item = this.element.querySelector('[data-test-quick-list-item]');
        assert.dom(item).doesNotHaveClass('quick-list-item--with-leading');
        assert.dom('[data-test-quick-list-item-leading]').doesNotExist();
        assert.dom('[data-test-quick-list-item-body]').doesNotExist();
        let children = Array.from(item.children);
        assert.strictEqual(children.length, 2);
        assert.dom(children[0]).hasAttribute('data-test-quick-list-item-primary');
        assert.dom(children[1]).hasAttribute('data-test-quick-list-item-secondary');
    });

    test('with selection the row reads checkbox, then leading, then body', async function (assert) {
        this.items = [{ id: '1', name: 'Login form', initials: 'AL' }];
        await render(hbs`
          <QuickList @title="Issues" @items={{this.items}} @selectable={{true}}>
            <:item as |record Item|>
              <Item>
                <:leading><span data-test-initials>{{record.initials}}</span></:leading>
                <:primary><span>{{record.name}}</span></:primary>
              </Item>
            </:item>
          </QuickList>
        `);

        let row = this.element.querySelector('[data-test-quick-list-row]');
        let check = row.querySelector('[data-test-quick-list-check]');
        let leading = row.querySelector('[data-test-quick-list-item-leading]');
        let body = row.querySelector('[data-test-quick-list-item-body]');
        assert.ok(check && leading && body, 'the checkbox, leading column and body render');
        assert.ok(check.compareDocumentPosition(leading) & Node.DOCUMENT_POSITION_FOLLOWING, 'leading follows the checkbox');
        assert.ok(leading.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING, 'body follows leading');
        assert.dom(leading).hasText('AL');
        assert.dom(body).hasText('Login form');
    });
});

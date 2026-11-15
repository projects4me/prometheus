/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/tabs', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.set('active', 'a');
        this.changes = [];
        this.set('onChange', (name) => this.changes.push(name));
    });

    const template = hbs`
        <AppUi::Tabs @active={{this.active}} @onChange={{this.onChange}} data-test-tabs>
            <:tabs as |t|>
                <t.tab @name="a" data-test-tab="a">Alpha</t.tab>
                <t.tab @name="b" data-test-tab="b">Beta</t.tab>
            </:tabs>
            <:panes as |t|>
                <t.pane @name="a" data-test-pane="a">Alpha content</t.pane>
                <t.pane @name="b" data-test-pane="b">Beta content</t.pane>
            </:panes>
        </AppUi::Tabs>`;

    test('it renders the nav-tabs markup with the active tab and its pane', async function (assert) {
        await render(template);
        assert.dom('[data-test-tabs] ul.nav.nav-tabs').exists();
        assert.dom('[data-test-tab]').exists({ count: 2 });
        assert.dom('[data-test-tab="a"]').hasText('Alpha').hasAttribute('aria-selected', 'true');
        assert.dom('[data-test-tab="a"]').hasAttribute('href', '#');
        assert.dom('li.active [data-test-tab="a"]').exists();
        assert.dom('li.active [data-test-tab="b"]').doesNotExist();
        assert.dom('[data-test-tab="b"]').hasAttribute('aria-selected', 'false');
        assert.dom('.tab-content > .tab-pane.active[data-test-pane="a"]').hasText('Alpha content');
        assert.dom('[data-test-pane="b"]').doesNotExist();
    });

    test('a click reports the tab name and does not change the active tab itself', async function (assert) {
        await render(template);
        await click('[data-test-tab="b"]');
        assert.deepEqual(this.changes, ['b']);
        assert.dom('[data-test-pane="a"]').exists();
        assert.dom('[data-test-pane="b"]').doesNotExist();
    });

    test('it follows @active', async function (assert) {
        await render(template);
        this.set('active', 'b');
        assert.dom('li.active [data-test-tab="b"]').exists();
        assert.dom('[data-test-pane="b"]').hasText('Beta content');
        assert.dom('[data-test-pane="a"]').doesNotExist();
    });

    test('it works without @onChange', async function (assert) {
        await render(hbs`
            <AppUi::Tabs @active="a">
                <:tabs as |t|><t.tab @name="a" data-test-tab="a">Alpha</t.tab></:tabs>
                <:panes as |t|><t.pane @name="a">x</t.pane></:panes>
            </AppUi::Tabs>`);
        await click('[data-test-tab="a"]');
        assert.dom('[data-test-tab="a"]').exists();
    });
});

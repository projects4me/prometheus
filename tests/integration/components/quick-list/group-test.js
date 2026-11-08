/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | quick-list/group', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.set('group', { key: 'new', label: 'New', items: [1, 2, 3], count: 3 });
        this.set('collapsed', false);
        this.set('toggle', () => this.set('collapsed', !this.collapsed));
    });

    test('it shows the label, the count and the items', async function (assert) {
        await render(hbs`<QuickList::Group @group={{this.group}} @collapsed={{this.collapsed}} @onToggle={{this.toggle}}><p class="item">row</p></QuickList::Group>`);
        assert.dom('[data-test-quick-list-group-label]').hasText('New');
        assert.dom('[data-test-quick-list-group-count]').hasText('3');
        assert.dom('.fa-caret-down').exists();
        assert.dom('.item').exists();
    });

    test('clicking the heading toggles collapsing', async function (assert) {
        await render(hbs`<QuickList::Group @group={{this.group}} @collapsed={{this.collapsed}} @onToggle={{this.toggle}}><p class="item">row</p></QuickList::Group>`);
        await click('[data-test-quick-list-group-toggle]');
        assert.dom('.item').doesNotExist();
        assert.dom('.fa-caret-right').exists();
        assert.dom('[data-test-quick-list-group-toggle]').hasAttribute('aria-expanded', 'false');
        await click('[data-test-quick-list-group-toggle]');
        assert.dom('.item').exists();
    });

    test('the heading block replaces the label', async function (assert) {
        await render(hbs`<QuickList::Group @group={{this.group}} @collapsed={{this.collapsed}} @onToggle={{this.toggle}}><:heading as |g|><b class="custom">Custom {{g.key}}</b></:heading><:default>row</:default></QuickList::Group>`);
        assert.dom('.custom').hasText('Custom new');
        assert.dom('[data-test-quick-list-group-label]').doesNotContainText('New');
        assert.dom('[data-test-quick-list-group-count]').hasText('3');
    });

    test('a group without a key shows the translated None label', async function (assert) {
        this.set('group', { key: null, label: null, items: [], count: 1 });
        await render(hbs`<QuickList::Group @group={{this.group}} @collapsed={{this.collapsed}} @onToggle={{this.toggle}} />`);
        assert.dom('[data-test-quick-list-group-label]').hasText('None');
    });
});

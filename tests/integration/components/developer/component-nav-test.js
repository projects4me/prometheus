/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';
import { ComponentRegistry } from 'prometheus/utils/developer/component-registry';

const NAV = '[data-developer-nav]';

module('Integration | Component | developer/component-nav', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
        this.owner.setupRouter();
        this.set('registry', new ComponentRegistry([
            { name: 'menu', label: 'Context Menu', group: 'Menus', status: 'stable', summary: 'Opens on right click.' },
            { name: 'list', label: 'Quick List', group: 'Lists', status: 'experimental', summary: 'Pages and groups rows.' },
            { name: 'tree', label: 'Tree List', group: 'Lists', status: 'stable', summary: 'Nested rows.' }
        ]));
    });

    test('it lists the entries by group with a count and marks the active one', async function (assert) {
        await render(hbs`<Developer::ComponentNav @registry={{this.registry}} @active="tree"/>`);

        assert.dom(`${NAV} .box-title`).hasText('Components');
        assert.dom(`${NAV} [data-developer-nav-count]`).hasText('3');
        let groups = [...this.element.querySelectorAll('[data-developer-group]')].map(el => el.textContent.trim());
        assert.deepEqual(groups, ['Lists', 'Menus']);
        assert.dom(`${NAV} li.active`).exists({ count: 1 });
        assert.dom(`${NAV} [data-developer-item="tree"]`).hasClass('active');
        assert.dom(`${NAV} [data-developer-item="list"] .label-warning`).hasText('experimental');
    });

    test('the search filters the entries by label or summary', async function (assert) {
        await render(hbs`<Developer::ComponentNav @registry={{this.registry}} @active={{null}}/>`);

        await fillIn(`${NAV} [data-developer-nav-search] input`, 'right click');
        await settled();
        assert.dom(`${NAV} [data-developer-item]`).exists({ count: 1 });
        assert.dom(`${NAV} [data-developer-item="menu"]`).exists();
        assert.dom(`${NAV} [data-developer-nav-count]`).hasText('3', 'the count stays the total');

        await fillIn(`${NAV} [data-developer-nav-search] input`, 'nothing at all');
        await settled();
        assert.dom(`${NAV} [data-developer-item]`).doesNotExist();
        assert.dom(`${NAV} [data-developer-nav-empty]`).exists();
    });
});

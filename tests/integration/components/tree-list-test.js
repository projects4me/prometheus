/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | tree-list', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        let transitions = (this.transitions = []);
        this.owner.register('service:router', class extends Service {
            transitionTo(...args) {
                transitions.push(args);
            }
        });
        this.set('tree', {
            Home: { name: 'Home', nodes: { Setup: { name: 'Setup', nodes: {} } } },
            About: { name: 'About', nodes: {} },
        });
    });

    test('it renders the pages as a nested list', async function (assert) {
        await render(hbs`<ul><TreeList @lists={{this.tree}} /></ul>`);

        assert.dom('li.wiki-list-parent > a').hasText('Home');
        assert.dom('li.wiki-list-parent > ul > li.wiki-list-no-parent > a').hasText('Setup');
        assert.dom('ul > li.wiki-list-no-parent > a').exists({ count: 2 });
    });

    test('it opens the clicked wiki page, at any depth', async function (assert) {
        await render(hbs`<ul><TreeList @lists={{this.tree}} /></ul>`);

        await click('li.wiki-list-parent > ul a');
        await click('li.wiki-list-parent > a');

        assert.deepEqual(this.transitions, [
            ['app.project.wiki.page', 'Setup'],
            ['app.project.wiki.page', 'Home'],
        ]);
    });
});

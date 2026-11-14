/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, clearRender } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import $ from 'jquery';

module('Integration | Component | application-controlbar', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders the AdminLTE control sidebar', async function (assert) {
        await render(hbs`<ApplicationControlbar />`);

        assert.dom('aside.control-sidebar.control-sidebar-dark').exists();
        assert.dom('aside .control-sidebar-tabs li').exists({ count: 2 });
        assert.dom('aside #control-sidebar-home-tab').hasClass('active');
        assert.dom('aside #control-sidebar-settings-tab input[type=checkbox]').isChecked();
    });

    test('it activates the sidebar on insert and unbinds the toggle on teardown', async function (assert) {
        let controlSidebar = $.AdminLTE.controlSidebar;
        let originalActivate = controlSidebar.activate;
        let activations = 0;
        controlSidebar.activate = () => activations++;
        let toggle = document.createElement('a');
        toggle.setAttribute('data-toggle', 'control-sidebar');
        document.body.appendChild(toggle);

        try {
            $(toggle).on('click', () => assert.step('toggle'));

            await render(hbs`<ApplicationControlbar />`);
            assert.strictEqual(activations, 1, 'activated once');

            await clearRender();
            $(toggle).trigger('click');
            assert.verifySteps([], 'toggle click handler removed');
        } finally {
            controlSidebar.activate = originalActivate;
            toggle.remove();
        }
    });
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/empty-state', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the icon, message and action', async function (assert) {
        await render(hbs`
            <AppUi::EmptyState @icon="fa-info-circle" @message="Nothing here">
                <:action><a href="#">Add one</a></:action>
            </AppUi::EmptyState>`);

        assert.dom('[data-test-empty-state-icon]').hasClass('fa-info-circle');
        assert.dom('[data-test-empty-state-message]').hasText('Nothing here');
        assert.dom('[data-test-empty-state-action]').hasText('Add one');
    });

    test('icon defaults to info-circle and action is optional', async function (assert) {
        await render(hbs`<AppUi::EmptyState @message="Empty" />`);

        assert.dom('[data-test-empty-state-message]').hasText('Empty');
        assert.dom('[data-test-empty-state-icon]').hasClass('fa-info-circle');
        assert.dom('[data-test-empty-state-action]').doesNotExist();
    });
});

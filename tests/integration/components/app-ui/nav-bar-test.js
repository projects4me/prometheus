/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import CurrentUserStub from '../../stub-services/current-user-stub';

module('Integration | Component | nav-bar', function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders', async function (assert) {
        this.owner.register('service:current-user', CurrentUserStub);

        await render(hbs`
            <AppUi::NavBar />
        `);

        assert.dom('div.user-panel  div.pull-left.info p#user-name').hasText('Rana Nouman');
    });
});

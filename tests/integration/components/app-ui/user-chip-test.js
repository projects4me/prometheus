/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/user-chip', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the avatar and the name', async function (assert) {
        this.set('user', { id: 2, name: 'Ada Lovelace' });
        await render(hbs`<AppUi::UserChip @user={{this.user}} @size="sm" />`);

        assert.dom('[data-test-user-chip-name]').hasText('Ada Lovelace');
        assert.dom('[data-test-user-chip] [data-test-avatar]').hasAttribute('data-size', 's');
        assert.dom('a[data-test-user-chip-name]').doesNotExist();
    });
});

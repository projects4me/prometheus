/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/avatar', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the user image as an img-circle', async function (assert) {
        this.set('user', { id: 7, name: 'Ada Lovelace' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} />`);

        assert.dom('img[data-test-avatar]').hasClass('img-circle');
        assert.dom('img[data-test-avatar]').hasAttribute('src', /\/userimage\/get\/7$/);
        assert.dom('img[data-test-avatar]').hasAttribute('alt', 'Ada Lovelace');
        assert.dom('img[data-test-avatar]').doesNotHaveClass('img-sm');
    });

    test('it applies the AdminLTE sizes', async function (assert) {
        this.set('user', { id: 1, name: 'Ada' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="sm" /><AppUi::Avatar @user={{this.user}} @size="xs" />`);

        assert.dom('img.img-sm').exists({ count: 1 });
        assert.dom('img.img-xs').exists({ count: 1 });
    });

    test('it shows the agent avatar for an agent', async function (assert) {
        this.set('user', { id: 2, name: 'Agent', type: 'agent' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="sm" />`);

        assert.dom('[data-user-agent-avatar]').exists();
        assert.dom('img').doesNotExist();
    });
});

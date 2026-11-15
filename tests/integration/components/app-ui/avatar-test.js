/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

module('Integration | Component | app-ui/avatar', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the profile picture', async function (assert) {
        this.set('user', { id: 1, name: 'Ada Lovelace', profilePicture: 'http://x.test/a.png' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} />`);

        assert.dom('[data-test-avatar-image]').hasAttribute('src', 'http://x.test/a.png');
        assert.dom('[data-test-avatar-image]').hasAttribute('alt', 'Ada Lovelace');
        assert.dom('[data-test-avatar]').hasClass('app-avatar-md');
    });

    test('it uses the user image endpoint for the placeholder picture', async function (assert) {
        this.set('user', { id: 7, name: 'Ada', profilePicture: '/img/default.png' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} />`);

        assert.dom('[data-test-avatar-image]').hasAttribute('src', /\/userimage\/get\/7$/);
    });

    test('it shows initials without an id', async function (assert) {
        this.set('user', { name: 'ada  byron lovelace' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="lg" />`);

        assert.dom('[data-test-avatar-image]').doesNotExist();
        assert.dom('[data-test-avatar-initials]').hasText('AB');
        assert.dom('[data-test-avatar]').hasClass('app-avatar-lg');
    });

    test('it falls back to initials when the image fails', async function (assert) {
        this.set('user', { id: 3, name: 'Grace Hopper', profilePicture: PIXEL });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="sm" />`);
        // an image error does not bubble; a bubbling one would reach window.onerror
        this.element.querySelector('[data-test-avatar-image]').dispatchEvent(new Event('error'));
        await settled();

        assert.dom('[data-test-avatar-initials]').hasText('GH');
        assert.dom('[data-test-avatar]').hasClass('app-avatar-sm');
    });
});

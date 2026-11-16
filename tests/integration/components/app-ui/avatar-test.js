/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/avatar', function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the user image as an img-circle at size m by default', async function (assert) {
        this.set('user', { id: 7, name: 'Ada Lovelace' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} />`);

        assert.dom('[data-test-avatar]').hasAttribute('data-size', 'm');
        assert.dom('[data-test-avatar-image]').hasClass('img-circle');
        assert.dom('[data-test-avatar-image]').hasAttribute('data-image-url', /\/userimage\/get\/7$/);
        assert.dom('[data-test-avatar-image]').hasAttribute('alt', 'Ada Lovelace');
    });

    test('it has the standard sizes, sm as an alias of s and m for unknown values', async function (assert) {
        this.set('user', { id: 1, name: 'Ada' });
        this.set('size', 'xs');
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size={{this.size}} />`);

        let expected = { xs: ['xs', 20], s: ['s', 30], sm: ['s', 30], m: ['m', 40], l: ['l', 96], huge: ['m', 40] };
        for (let [size, [name, pixels]] of Object.entries(expected)) {
            this.set('size', size);
            await settled();
            assert.dom('[data-test-avatar]').hasAttribute('data-size', name, `${size} is ${name}`);
            assert.strictEqual(this.element.querySelector('[data-test-avatar]').offsetWidth, pixels, `${size} is ${pixels}px`);
        }
    });

    test('it shows the default image when there is no id', async function (assert) {
        this.set('user', { name: 'No Image' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="l" />`);

        assert.dom('[data-test-avatar-image]').hasAttribute('src', '/img/default.png');
    });

    test('it falls back to the default image when the image fails', async function (assert) {
        this.set('user', { id: 7, name: 'Ada' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} />`);
        this.element.querySelector('[data-test-avatar-image]').dispatchEvent(new Event('error'));
        await settled();

        assert.dom('[data-test-avatar-image]').hasAttribute('src', '/img/default.png');
    });

    test('an agent with a picture shows it with the robot marker from size s up', async function (assert) {
        this.set('user', { id: 2, name: 'Odysseus', type: 'agent', profilePicture: '/img/pm.png' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="s" /><AppUi::Avatar @user={{this.user}} @size="xs" />`);

        assert.dom('[data-agent-avatar-picture]').exists({ count: 2 });
        assert.dom('[data-test-avatar-marker]').exists({ count: 2 });
        let [small, tiny] = this.element.querySelectorAll('[data-test-avatar-marker]');
        assert.notStrictEqual(getComputedStyle(small).display, 'none', 'visible at s');
        assert.strictEqual(getComputedStyle(tiny).display, 'none', 'hidden at xs');
        assert.dom('[data-test-avatar]').hasAttribute('title', 'Odysseus (agent)');
    });

    test('an agent without a picture shows the robot icon and no marker', async function (assert) {
        this.set('user', { id: 3, name: 'Achilles', type: 'agent' });
        await render(hbs`<AppUi::Avatar @user={{this.user}} @size="l" />`);

        assert.dom('[data-user-agent-avatar] .fa-android').exists();
        assert.dom('[data-agent-avatar-picture]').doesNotExist();
        assert.dom('[data-test-avatar-marker]').doesNotExist();
    });
});

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
        assert.dom('[data-test-user-chip-name]').hasAttribute('title', 'Ada Lovelace');
        assert.dom('[data-test-user-chip] [data-test-avatar]').hasClass('app-avatar-sm');
    });

    test('it truncates a long name with an ellipsis', async function (assert) {
        this.set('user', { id: 2, name: 'A very long name that cannot fit in the box it is given' });
        await render(hbs`<div data-test-wrap><AppUi::UserChip @user={{this.user}} /></div>`);

        this.element.querySelector('[data-test-wrap]').style.width = '120px';
        let name = this.element.querySelector('[data-test-user-chip-name]');

        assert.strictEqual(getComputedStyle(name).textOverflow, 'ellipsis');
        assert.ok(name.scrollWidth > name.clientWidth, 'the name is cut');
    });
});

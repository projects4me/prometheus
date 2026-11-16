/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | project/member-avatars', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.set('members', [
            { id: 1, name: 'Ada Lovelace' },
            { id: 2, name: 'Grace Hopper' },
            { id: 3, name: 'Alan Turing' }
        ]);
    });

    test('it renders the avatars and the overflow badge at size m by default', async function (assert) {
        await render(hbs`<Project::MemberAvatars @members={{this.members}} @maxVisible={{2}} />`);

        assert.dom('[data-test-avatar]').exists({ count: 2 });
        assert.dom('[data-test-avatar]').hasAttribute('data-size', 'm');
        assert.dom('.member-avatars-overflow').hasClass('member-avatars-overflow-m');
    });

    ['xs', 's', 'm', 'ml', 'l'].forEach((size) => {
        test(`it passes @size="${size}" to every avatar and the overflow badge`, async function (assert) {
            this.set('size', size);
            await render(hbs`<Project::MemberAvatars @members={{this.members}} @maxVisible={{2}} @size={{this.size}} />`);

            assert.dom('[data-test-avatar]').exists({ count: 2 });
            assert.dom('[data-test-avatar]').hasClass(`app-ui-avatar-${size}`);
            assert.dom('.member-avatars-overflow').hasClass(`member-avatars-overflow-${size}`);
        });
    });
});

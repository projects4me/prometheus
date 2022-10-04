/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-profile/close-members', function (hooks) {
    setupRenderingTest(hooks);

    test('it render close members of user', async function (assert) {

        let users = [
            {
                "name": "User A",
                "title": "Software Engineer"
            },
            {
                "name": "User B",
                "title": "Project Manager"
            }
        ]

        this.set('users', users);

        await render(hbs`
            <UserProfile::CloseMembers
                @users={{this.users}}
            />
        `);

        users.forEach((user) => {
            let userSelector = `[data-user="${user.name}"]`;
            assert.dom(`${userSelector} [data-close-member="name"]`).hasText(user.name);
            assert.dom(`${userSelector} [data-close-member="title"]`).hasText(user.title);
        });

    });
});

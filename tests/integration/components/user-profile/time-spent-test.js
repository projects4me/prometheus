/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-profile/time-spent', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders time spent component by passing some issue time spents', async function (assert) {

        await render(hbs`
            <UserProfile::TimeSpent
                @timeSpent="13026"
            />
        `);

        assert.dom('div[data-time-format="Days"]').hasAnyText('27');
        assert.dom('div[data-time-format="Hours"]').hasAnyText('01');
    });

    test('it renders time spent component without passing issue time spent', async function (assert) {

        await render(hbs`
            <UserProfile::TimeSpent
                @timeSpent="0"
            />
        `);

        assert.dom('div[data-time-format="Hours"]').hasAnyText('0');
        assert.dom('div[data-time-format="Minutes"]').hasAnyText('0');
    });
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-profile/collaboration', function (hooks) {
    setupRenderingTest(hooks);

    test(`it renders the collaboration component with value < 50`, async function (assert) {
        this.set('value', "13");

        await render(hbs`
            <UserProfile::Collaboration 
                @collaboration={{this.value}}
            />
        `);

        assert.dom('div[data-user-collaboration="value"]').hasText('13%');
        assert.dom('i').hasClass('fa-caret-down');
    });

    test(`it renders the collaboration component with value > 50`, async function (assert) {
        this.set('value', "51");

        await render(hbs`
            <UserProfile::Collaboration 
                @collaboration={{this.value}}
            />
        `);

        assert.dom('div[data-user-collaboration="value"]').hasText('51%');
        assert.dom('i').hasClass('fa-caret-up');
    });
});

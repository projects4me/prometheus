/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/index', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            createdSince: "05 days",
            createdUserName: "Rana Nouman",
            description: "Some activity was performed"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::Index
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-bell-o');
        assert.dom('[data-activity="dateCreated"]').hasText('05 days ago');
        assert.dom('[data-activity="description"]').hasText(`Some activity was performed`);
    });
});

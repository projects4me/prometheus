/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/issue/created', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            createdSince: "10 days",
            createdUserName: "Rana Nouman",
            type: "created",
            relatedTo: "issue",
            description: "emoji test issue was created"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::Issue::Created
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-briefcase');
        assert.dom('[data-activity="dateCreated"]').hasText('10 days ago');
        assert.dom('[data-activity="activityInfo"]').hasText(`Rana Nouman created the Issue`);
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});

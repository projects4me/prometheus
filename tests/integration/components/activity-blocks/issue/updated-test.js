/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/issue/updated', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            createdSince: "01 month",
            createdUserName: "Rana Nouman",
            type: "updated",
            relatedTo: "issue",
            description: "issue#456 was updated"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::Issue::Updated
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-pencil');
        assert.dom('[data-activity="dateCreated"]').hasText('01 month ago');
        assert.dom('[data-activity="activityInfo"]').hasText(`Rana Nouman updated the Issue`);
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});

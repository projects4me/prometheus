/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/issue/deleted', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            createdSince: "15 days",
            createdUserName: "Rana Nouman",
            type: "deleted",
            relatedTo: "issue",
            description: "issue#456 was deleted"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::Issue::Deleted
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-trash');
        assert.dom('[data-activity="dateCreated"]').hasText('15 days ago');
        assert.dom('[data-activity="activityInfo"]').hasText(`Rana Nouman deleted the Issue`);
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});

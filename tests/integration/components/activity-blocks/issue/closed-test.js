/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/issue/closed', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders activity-blocks|issue-closed component', async function (assert) {
        let activity = {
            createdSince: "5 days",
            createdUserName: "Rana Nouman",
            type: "closed",
            relatedTo: "issue",
            description: "issue#45 was closed"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::Issue::Closed
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-check-circle');
        assert.dom('[data-activity="dateCreated"]').hasText('5 days ago');
        assert.dom('[data-activity="activityInfo"]').hasText(`Rana Nouman closed the Issue`);
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});

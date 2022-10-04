/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/related-updated', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            relatedActivity: "updated",
            createdSince: "4 days",
            relatedActivityModule: "milestone",
            createdUserName: "Rana Nouman",
            description: "End Date updated for Milestone 'v1.0'"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::RelatedUpdated
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-pencil');
        assert.dom('[data-activity="dateCreated"]').hasText('4 days ago');
        assert.dom('[data-activity="activityInfo"]').hasText('Rana Nouman updated a Milestone');
        assert.dom('[data-activity="description"]').hasText(activity.description);
        
    });
});

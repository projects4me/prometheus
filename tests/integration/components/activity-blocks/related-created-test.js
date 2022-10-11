/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/related-created', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            relatedActivity: "completed",
            createdSince: "2 months",
            relatedActivityModule: "milestone",
            createdUserName: "Rana Nouman",
            description: "v0.1 milestone completed"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::RelatedCompleted
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-check');
        assert.dom('[data-activity="dateCreated"]').hasText('2 months ago');
        assert.dom('[data-activity="activityInfo"]').hasText('Rana Nouman marked completed a Milestone');
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});

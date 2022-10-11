/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/related-overdue', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            relatedActivity: "overdue",
            createdSince: "4 days",
            relatedActivityModule: "milestone",
            createdUserName: "Rana Nouman",
            description: "Milestone 'v1.0' is overdue"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::RelatedOverdue
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-exclamation-triangle');
        assert.dom('[data-activity="dateCreated"]').hasText('4 days ago');
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});

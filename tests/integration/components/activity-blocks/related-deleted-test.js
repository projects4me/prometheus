/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/related-deleted', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            relatedActivity: "deleted",
            createdSince: "4 days",
            relatedActivityModule: "file",
            createdUserName: "Rana Nouman",
            description: "abc.png file deleted"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::RelatedDeleted
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-trash-o');
        assert.dom('[data-activity="dateCreated"]').hasText('4 days ago');
        assert.dom('[data-activity="activityInfo"]').hasText('Rana Nouman deleted a File');
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});

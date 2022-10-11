/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/related-attached', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            relatedActivity: "attached",
            createdSince: "2 months",
            relatedActivityModule: "file",
            createdUserName: "Rana Nouman",
            description: "abc.png file was attached"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::RelatedAttached
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-paperclip');
        assert.dom('[data-activity="dateCreated"]').hasText('2 months ago');
        assert.dom('[data-activity="activityInfo"]').hasText('Rana Nouman added a File');
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});

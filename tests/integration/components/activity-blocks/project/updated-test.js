/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/project/updated', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            createdSince: "01 week",
            createdUserName: "Rana Nouman",
            type: "updated",
            relatedTo: "project",
            description: "APROM was updated"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::Project::Updated
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-bolt');
        assert.dom('[data-activity="dateCreated"]').hasText('01 week ago');
        assert.dom('[data-activity="activityInfo"]').hasText(`Rana Nouman updated the Project`);
        assert.dom('[data-activity="description"]').hasText(activity.description);
    });
});

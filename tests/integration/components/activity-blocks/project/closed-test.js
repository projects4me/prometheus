/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | activity-blocks/project/closed', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let activity = {
            createdSince: "01 day",
            createdUserName: "Rana Nouman",
            type: "closed",
            relatedTo: "project",
            description: "APROM was closed"
        }

        this.set('activity', activity);

        await render(hbs`
            <ActivityBlocks::Project::Closed
                @activity={{this.activity}}
            />
        `);

        assert.dom('i').hasClass('fa-diamond');
        assert.dom('[data-activity="dateCreated"]').hasText('01 day ago');
        assert.dom('[data-activity="activityInfo"]').hasText(`Rana Nouman closed the Project`);
        assert.dom('[data-activity="description"]').hasText(activity.description);    });
});

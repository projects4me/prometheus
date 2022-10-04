/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-profile/recent-activities', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders component without any activities', async function (assert) {
        await render(hbs`
            <UserProfile::RecentActivities
            />        
        `);

        assert.dom(this.element).hasText('No Activity Recorded');
    });

    test('it renders component with some activities', async function (assert) {
        let activities = [
            {
                "relatedTo": "project",
                "type": "updated",
                "dateCreated": "2022-09-28 05:57:50"
            },
            {
                "relatedTo": "issue",
                "type": "updated",
                "dateCreated": "2022-09-28 05:57:50"
            }
        ]

        let expectedAnswers = [
            {
                "activityBlockType": "project-updated",
                "iconClass": "fa-bolt"
            },
            {
                "activityBlockType": "issue-updated",
                "iconClass": "fa-pencil"
            }
        ]

        this.set('activities', activities);

        await render(hbs`
            <UserProfile::RecentActivities
                @activities={{this.activities}}
            />
        `);

        expectedAnswers.forEach((activity, i) => {
            let createdSince = moment.duration(moment(new Date()).diff(moment(activities[i].dateCreated))).humanize();
            let activityBlockSelector = `[data-activity-block-type="${activity.activityBlockType}"]`;
            assert.dom(activityBlockSelector).exists();
            assert.dom(`${activityBlockSelector} i`).hasClass(`${activity.iconClass}`);
            assert.dom(`${activityBlockSelector} [data-activity="dateCreated"]`).hasText(`${createdSince} ago`);
        });

    });
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user-profile/latest-issues', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders component with some issues', async function (assert) {
        let issues = [
            {
                subject: "issue A",
                projectShortCode: "PROA",
                status: "in_progress",
            },
            {
                subject: "issue B",
                projectShortCode: "PROB",
                status: "new",
            }
        ]

        let currentDate = luxon.DateTime.now().toFormat('dd MMMM yyyy');

        let expectedAnswers = [
            {
                subject: "issue A",
                projectShortCode: "(PROA)",
                status: "In Progress",
                dateCreated: `created on ${currentDate}`
            },
            {
                subject: "issue B",
                projectShortCode: "(PROB)",
                status: "New",
                dateCreated: `created on ${currentDate}`
            }
        ]

        this.set('issues', issues);

        await render(hbs`
            <UserProfile::LatestIssues
                @issues={{this.issues}}
            />
        `);

        expectedAnswers.forEach((issue) => {
            for (const [key, value] of Object.entries(issue)) {
                assert.dom(`[data-issue="${issue.subject}"] [data-latest-issue-field="${key}"]`).hasText(value);
            }
        });
    });

    test('it render component without issue', async function (assert) {
        let issues = [];
        
        this.set('issues', issues);
        
        await render(hbs`
            <UserProfile::LatestIssues
                @issues={{this.issues}}
            />
        `);

        assert.dom('div.no-content div.description').hasText('No Issues found');
    });
});

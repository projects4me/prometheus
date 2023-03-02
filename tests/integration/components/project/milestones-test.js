import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | project/milestones', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders some milestones of project', async function (assert) {
		let issues = [
            {
                subject: "Issue Test 1",
                status: "done"
            },
            {
                subject: "Issue Test 2",
                status: "complete"
            },
            {
                subject: "Issue Test 3",
                status: "closed"
            },
            {
                subject: "Issue Test 4",
                status: "done"
            }
        ]

        let milestones = [
            {
                name: "Beta",
                status: "in_progress",
                startDate: "2015-05-19",
                endDate: "2022-04-22",
                milestoneType: "version",
                issues: issues
            },
            {
                name: "v0.1",
                status: "closed",
                startDate: "2016-05-19",
                endDate: "2021-04-22",
                milestoneType: "version",
                issues: issues
            },
        ]
        let editMilestone = () => true;

        this.set('editMilestone', editMilestone);

        for (let i = 0; i < milestones.length; i++) {
            let milestone = milestones[i];
            this.set('milestone', milestone);

            await render(hbs`
                <Project::Milestones
                    @milestone={{this.milestone}}
                    @editMilestone{{this.editMilestone}}
                />
            `);
            let milestoneEl = document.querySelector(`[data-milestone='${milestone.name} | ${milestone.startDate}']`);
            assert.dom(milestoneEl).exists();
            assert.dom(milestoneEl.querySelector('[data-milestone="details"]')).hasText(`${milestone.name} - ${milestone.issues.length} Issues`);
        }
	});
});

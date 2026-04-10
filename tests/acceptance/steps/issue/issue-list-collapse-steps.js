/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';

/**
 * Step definitions specific to the Issue List collapse / expand feature.
 * The shared divider-handle and issue-panel width steps live in:
 *   tests/acceptance/steps/common-steps/issue-details-panel-steps.js
 *
 * @module tests/acceptance/steps/issue/issue-list-collapse-steps
 */
export default function (assert) {
	return steps(assert)

	/**
	 * Clicks the first issue row link in the issue list table to open the
	 * issue details panel, which also makes the divider handle appear.
	 */
	.given('User clicks on first issue from the issue list to open details', async function () {
		let issue = server.schema.issues.all().models[0];
		let row = document.querySelector(`tr.issue[data-issue-id="${issue.id}"]`);
		assert.ok(row, 'First issue row should exist in the list');
		let link = row.querySelector('a[data-field="issue.number"]');
		assert.ok(link, 'Issue number link should exist in the first row');
		await click(link);
	})

	/**
	 * Verifies the issue list content (.list-view) is gone while collapsed.
	 */
	.then('User should not see the issue list content', function () {
		let listView = document.querySelector('.list-view');
		assert.notOk(listView, 'Issue list content should not be visible when collapsed');
	})

	/**
	 * Verifies the issue list content (.list-view) is restored after expanding.
	 */
	.then('User should see the issue list content', function () {
		let listView = document.querySelector('.list-view');
		assert.ok(listView, 'Issue list content should be visible when expanded');
	});
}

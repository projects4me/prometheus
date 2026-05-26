/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';
import Context from '../../../../mirage/yadda-context/context';
import Collection from 'ember-cli-mirage/orm/collection';

/**
 * Step definitions specific to the Task Board collapse / expand feature.
 * The shared divider-handle and issue-panel width steps live in:
 *   tests/acceptance/steps/common-steps/issue-details-panel-steps.js
 *
 * @module tests/acceptance/steps/taskboard/board-collapse-steps
 */
export default function (assert) {
	return steps(assert)

	/**
	 * Clicks the first issue card link on the board to open the issue details
	 * panel, which also makes the divider handle appear.
	 */
	.given('User clicks on first issue on the board to open details', async function () {
		let issue = server.schema.issues.all().models[0];
		let issueLink = document.querySelector(`[data-field-issue-id="${issue.id}"] a`);
		assert.ok(issueLink, 'First issue link should exist on the board');
		await click(issueLink);
	})

	/**
	 * Verifies the task board content (.board-container) is gone while collapsed.
	 */
	.then('User should not see the task board content', function () {
		let boardContainer = document.querySelector('.board-container');
		assert.notOk(boardContainer, 'Task board content should not be visible when collapsed');
	})

	/**
	 * Verifies the task board content (.board-container) is back after expanding.
	 */
	.then('User should see the task board content', function () {
		let boardContainer = document.querySelector('.board-container');
		assert.ok(boardContainer, 'Task board content should be visible when expanded');
	});
}

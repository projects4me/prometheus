/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';

/**
 * Step definitions for the Task Board collapse / expand feature.
 *
 * These steps cover:
 *  - Opening an issue to reveal the divider handle
 *  - Collapsing the board (board column removed, issue gets col-md-12)
 *  - Verifying board content is hidden and divider handle remains
 *  - Expanding the board by clicking the divider handle
 *  - Verifying the issue details panel transitions between col-md-4 and col-md-12
 *
 * @module tests/acceptance/steps/taskboard/board-collapse-steps
 */
export default function (assert) {
	return steps(assert)
	.given('User clicks on first issue on the board to open details', async function () {
		let issue = server.schema.issues.all().models[0];
		let issueLink = document.querySelector(`[data-field-issue-id="${issue.id}"] a`);
		assert.ok(issueLink, 'First issue link should exist on the board');
		await click(issueLink);
	})
	.then('User should see the board collapse button', function () {
		let divider = document.querySelector('.board-panel-divider');
		assert.ok(divider, 'Board panel divider should be visible');
	})
	.then('User should not see the board collapse button', function () {
		let divider = document.querySelector('.board-panel-divider');
		assert.notOk(divider, 'Board panel divider should not be visible');
	})
	.when('User clicks the board collapse button', async function () {
		let divider = document.querySelector('.board-panel-divider');
		assert.ok(divider, 'Board panel divider should exist before clicking');
		await click(divider);
	})

	.then('User should see the board collapsed strip', function () {
		let boardContainer = document.querySelector('.board-container');
		let divider = document.querySelector('.board-panel-divider');
		assert.notOk(boardContainer, 'Board content should be hidden when collapsed');
		assert.ok(divider, 'Divider handle should still be visible for expanding');
	})
	.then('User should not see the task board content', function () {
		let boardContainer = document.querySelector('.board-container');
		assert.notOk(boardContainer, 'Task board content should not be visible when collapsed');
	})
	.then('User should see the task board content', function () {
		let boardContainer = document.querySelector('.board-container');
		assert.ok(boardContainer, 'Task board content should be visible when expanded');
	})
	.when('User clicks the board collapsed strip to expand', async function () {
		let divider = document.querySelector('.board-panel-divider');
		assert.ok(divider, 'Board panel divider should exist before expanding');
		await click(divider);
	})
	.then('The issue details panel should be in full width mode', function () {
		let fullWidthPanel = document.querySelector('.col-md-12.issue-details-container');
		assert.ok(fullWidthPanel, 'Issue details panel should have col-md-12 class for full width');
	})
	.then('The issue details panel should be in default width mode', function () {
		let defaultWidthPanel = document.querySelector('.col-md-4.issue-details-container');
		assert.ok(defaultWidthPanel, 'Issue details panel should have col-md-4 class for default width');
	});
}

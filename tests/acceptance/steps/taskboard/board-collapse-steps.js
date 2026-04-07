/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';

/**
 * Step definitions for the Task Board collapse / expand feature.
 *
 * These steps cover:
 *  - Opening an issue to reveal the collapse button
 *  - Collapsing the board to a vertical strip
 *  - Verifying the collapsed strip label and absence of the board
 *  - Expanding the board by clicking the strip
 *  - Verifying the issue details panel enters full-width mode when collapsed
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
		let collapseBtn = document.querySelector('.board-collapse-btn');
		assert.ok(collapseBtn, 'Board collapse button should be visible');
	})
	.then('User should not see the board collapse button', function () {
		let collapseBtn = document.querySelector('.board-collapse-btn');
		assert.notOk(collapseBtn, 'Board collapse button should not be visible');
	})
	.when('User clicks the board collapse button', async function () {
		let collapseBtn = document.querySelector('.board-collapse-btn');
		assert.ok(collapseBtn, 'Board collapse button should exist before clicking');
		await click(collapseBtn);
	})

	.then('User should see the board collapsed strip', function () {
		let strip = document.querySelector('.board-collapsed-strip');
		assert.ok(strip, 'Board collapsed strip should be visible');
	})
	.then('The collapsed strip should show $labelText label', async function (labelText) {
		labelText = labelText.replace(/^"+|"+$/g, '');
		let labelElement = document.querySelector('.board-collapsed-strip .board-strip-label');
		assert.ok(labelElement, 'Board strip label element should exist');
		assert.equal(
			labelElement.innerText.trim(),
			labelText,
			`Collapsed strip label should read ${labelText}`
		);
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
		let strip = document.querySelector('.board-collapsed-strip');
		assert.ok(strip, 'Board collapsed strip should exist before clicking');
		await click(strip);
	})
	.then('The issue details panel should be in full width mode', function () {
		let fullWidthPanel = document.querySelector('.col-md-11.issue-details-container');
		assert.ok(fullWidthPanel, 'Issue details panel should have col-md-11 class for full width');
	})
	.then('The issue details panel should be in default width mode', function () {
		let defaultWidthPanel = document.querySelector('.col-md-4.issue-details-container');
		assert.ok(defaultWidthPanel, 'Issue details panel should have col-md-4 class for default width');
	})
	.then('The board column should be collapsed to minimum width', function () {
		let collapsedColumn = document.querySelector('.board-column--collapsed.col-md-1');
		assert.ok(collapsedColumn, 'Board column should have board-column--collapsed and col-md-1 classes');
	});
}

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';
import Context from '../../../../mirage/yadda-context/context';
import { Collection } from 'miragejs';

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
	})

	/**
	 * Clicks the collapse or expand button of a status lane.
	 */
	.when('User toggles the $status lane', async function (status) {
		let toggle = document.querySelector(`[data-lane-toggle="${status}"]`);
		assert.ok(toggle, `Toggle of the ${status} lane should exist`);
		await click(toggle);
	})

	/**
	 * Verifies the lane is collapsed: marked, narrow and without visible cards.
	 */
	.then('The $status lane should be collapsed', function (status) {
		let lane = document.querySelector(`[data-lane-toggle="${status}"]`).closest('.lane');
		assert.ok(lane.classList.contains('lane-collapsed'), `${status} lane should be collapsed`);
		assert.notOk(lane.querySelector(':scope > .box-body').offsetParent, 'Cards of a collapsed lane are hidden');
		assert.ok(lane.querySelector('.fa-angle-right'), 'Collapsed lane shows the expand button');
	})

	/**
	 * Verifies the lane is expanded again.
	 */
	.then('The $status lane should be expanded', function (status) {
		let lane = document.querySelector(`[data-lane-toggle="${status}"]`).closest('.lane');
		assert.notOk(lane.classList.contains('lane-collapsed'), `${status} lane should be expanded`);
		assert.ok(lane.querySelector('.fa-angle-left'), 'Expanded lane shows the collapse button');
	})

	/**
	 * Verifies the collapsed lanes are stored per project in localStorage.
	 */
	.then('The $status lane should be remembered as collapsed', function (status) {
		let keys = Object.keys(window.localStorage).filter((key) => key.startsWith('board-collapsed-lanes:'));
		assert.equal(keys.length, 1, 'One entry per project is stored');
		assert.ok(JSON.parse(window.localStorage.getItem(keys[0])).includes(status), `${status} is in the stored list`);
	});
}

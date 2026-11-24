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
	 * Collapses every expanded status lane.
	 */
	.when('User collapses every lane', async function () {
		let toggles = Array.from(document.querySelectorAll('[data-lane-toggle]'));
		assert.ok(toggles.length > 0, 'The board has lanes');
		for (let toggle of toggles) {
			if (!toggle.closest('.lane').classList.contains('lane-collapsed')) {
				await click(toggle);
			}
		}
	})

	/**
	 * Verifies the lane container keeps at least 45rem while all lanes are collapsed.
	 */
	.then('The board area should keep its minimum height', function () {
		try {
			let lanes = document.querySelectorAll('[data-lane-toggle]');
			lanes.forEach((toggle) => {
				assert.ok(toggle.closest('.lane').classList.contains('lane-collapsed'), 'Every lane is collapsed');
			});
			let container = document.querySelector('.board .milestone.box-body');
			assert.ok(container, 'The lane container exists');
			let minHeight = 45 * parseFloat(getComputedStyle(document.documentElement).fontSize);
			assert.ok(container.offsetHeight >= minHeight - 1, `Board area is at least 45rem high (${container.offsetHeight}px)`);
		} finally {
			// The collapsed lanes are persisted per project: don't leak them into other scenarios
			Object.keys(window.localStorage)
				.filter((key) => key.startsWith('board-collapsed-lanes:'))
				.forEach((key) => window.localStorage.removeItem(key));
		}
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

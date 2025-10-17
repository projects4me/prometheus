import steps from '../steps';
import { click } from '@ember/test-helpers';

export default function (assert) {
	return steps(assert)
		.when('User clicks create milestone button', async function () {
			await click('[data-add="milestone-create"]');
			assert.ok(true, 'User clicks create milestone button');
		})
		.when('User clicks on save milestone button', async function () {
			await click('button[data-btn="save"]');
			assert.ok(true, 'User clicks on save milestone button');
		})
		.then('There is a new milestone created with $milestoneName', async function (milestoneName) {
			const firstTab = document.querySelector('.milestone-tab:first-child');
			assert.ok(firstTab, 'First milestone tab should exist');
			assert.equal(firstTab.innerText.replace(/"/g, ''), milestoneName, `Milestone "${milestoneName}" should be created`);
		})
		.then('That milestone tab is active', async function () {
			const firstTab = document.querySelector('.milestone-tab:first-child');
			assert.ok(firstTab.classList.contains('active'), 'First milestone tab should be active');
		});
}
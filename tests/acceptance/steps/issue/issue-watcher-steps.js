/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click, waitFor } from '@ember/test-helpers';

export default function (assert) {
	return (
		steps(assert)
			.given('Issue is already being watched', async function () {
				const issueWatcher = server.create('issuewatcher', {
					issueId: '1',
					userId: '1',
					isWatching: '1'
				});

				let issue = server.schema.issues.find(1);
				issue.update({
					watchers: [issueWatcher]
				});
				assert.ok(true, 'Issue is set as watched');
			})
			.when('User clicks the watch button', async function () {
				await click('[data-btn="watcher"]');
				assert.ok(true, 'User clicked the watch button');
			})
			.then('The issue should be marked as watched', async function () {
				assert.dom('[data-btn="watcher"] .fa-eye-slash').exists();
				assert.ok(true, 'Issue is marked as watched');
			})
			.then('The issue should be marked as not watched', async function () {
				assert.dom('[data-btn="watcher"] .fa-eye').exists();
				assert.ok(true, 'Issue is marked as not watched');
			})
			.then('User should see success message "$message"', async function (message) {
				let inner = document.querySelector('.messenger-message-inner');
				assert.equal(inner.textContent, message);
				assert.ok(true, `Success message "${message}" should be displayed`);
			})
			.then('The watch button should show eye-slash icon', async function () {
				assert.dom('[data-btn="watcher"] .fa-eye-slash').exists('Watch button shows eye-slash icon');
			})
			.then('The watch button should show eye icon', async function () {
				assert.dom('[data-btn="watcher"] .fa-eye').exists('Watch button shows eye icon');
			})
	);
}

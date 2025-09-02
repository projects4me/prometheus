/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import steps from '../steps';
import { click } from '@ember/test-helpers';

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
			.given('User_1 is core member of issue 1', async function () {
				let issue = server.schema.issues.find(1);
				issue.update({
					assignee: '1',
					owner: '1',
					modifiedUser: '1',
					reportedUser: '1'
				});
				assert.ok(true, 'User_1 is set as core member (assignee)');
			})
			.given('User_1 is not core member of issue 1', async function () {
				let issue = server.schema.issues.find(1);
				issue.update({
					assignee: '2',
					owner: '2',
					modifiedUser: '2',
					reportedUser: '2'
				});
				assert.ok(true, 'User_1 is not set as core member (assignee)');
			})
			.given('Project has multiple members', async function () {
				let project = server.schema.projects.find(1);
				let users = server.schema.users.all().models.filter(user => user.id !== '1');
				project.update({
					members: users
				});
				assert.ok(true, 'Project has multiple members');
			})
			.given('User_2 is project member but not core member', async function () {
				let issue = server.schema.issues.find(1);
				issue.update({
					assignee: '1',
					owner: '1',
					modifiedUser: '1',
					reportedUser: '1'
				});
				assert.ok(true, 'User_2 is project member but not core member');
			})
			.given('User_2 previously unwatched issue 1', async function () {
				const issueWatcher = server.create('issuewatcher', {
					issueId: '1',
					userId: '2',
					isWatching: '0'
				});

				let issue = server.schema.issues.find(1);
				issue.update({
					watchers: [issueWatcher]
				});
				assert.ok(true, 'User_2 previously unwatched issue 1');
			})
			.when('User clicks the watch button', async function () {
				await click('[data-btn="watcher"]');
				assert.ok(true, 'User clicked the watch button');
			})
			.when('User clicks add watcher button', async function () {
				await click('[data-btn="add-watcher"]');
				assert.ok(true, 'User clicked add watcher button');
			})
			.when('User clicks add watcher for User_2', async function () {
				const user2MemberItem = document.querySelector('[data-member-id="2"]');
				const addButton = user2MemberItem.querySelector('.btn-success');
				await click(addButton);
				assert.ok(true, 'User clicked add watcher for User_2');
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
			.then('User should see add watcher button', async function () {
				assert.dom('[data-btn="add-watcher"]').exists('Add watcher button should be visible');
			})
			.then('The watch button should be disabled', async function () {
				assert.dom('[data-btn="watcher"]').hasAttribute('disabled');
			})
			.then('Available project members should be displayed', async function () {
				assert.dom('.project-members-list .member-item').exists('Project members should be displayed');
			})
			.then('Core members should not be in available list', async function () {
				assert.dom('[data-member-id="1"]').doesNotExist('Core member should not be in available list');
			})
			.then('Current user should not be in available list', async function () {
				assert.dom('[data-member-id="1"]').doesNotExist('Current user should not be in available list');
			})
			.then('Success message should be displayed', async function () {
				let inner = document.querySelector('.messenger-message-inner');
				assert.ok(inner, 'Success message should be displayed');
			})
			.then('User_2 should not appear in available members list', async function () {
				assert.dom('[data-member-id="2"]').doesNotExist('User_2 should not appear in available members list after being added');
			})
			.then('Current user should not be in available members list', async function () {
				assert.dom('[data-member-id="1"]').doesNotExist('Current user should not be in available members list');
			})
			.then('User_2 should appear in available members list', async function () {
				assert.dom('[data-member-id="2"]').exists('User_2 should appear in available members list');
			})
			.then('User can add User_2 as watcher again', async function () {
				const user2MemberItem = document.querySelector('[data-member-id="2"]');
				const addButton = user2MemberItem.querySelector('.btn-success');
				assert.ok(addButton, 'Add button should exist for User_2');
			})
	);
}

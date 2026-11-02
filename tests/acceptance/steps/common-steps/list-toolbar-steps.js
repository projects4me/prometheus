/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { click, settled } from '@ember/test-helpers';

/**
 * Steps for the activate, deactivate and export buttons of a list's toolbar. Downloads are captured by
 * replacing the list controller's `download`, so the test page never navigates away.
 *
 * @param {Object} library the yadda library to extend
 * @param {Object} assert the QUnit assert
 * @param {String} module the list's module, e.g. `agent`
 * @return {Object} the library
 */
export default function listToolbarSteps(library, assert, module) {
	let downloads = [];
	const row = (name) => Array.from(document.querySelectorAll(`[data-${module}-id]`)).find((el) => el.querySelector(`[data-${module}-field="name"]`).textContent.trim() === name);
	const lastDownload = () => new URL(downloads[downloads.length - 1], 'http://localhost');

	return library
		.given('Downloads of the list are captured', function () {
			downloads = [];
			this.owner.lookup(`controller:app.${module}.index`).download = (url) => downloads.push(url);
		})
		.when('User selects the row "$name"', async function (name) {
			await click(row(name).querySelector('input[type=checkbox]'));
		})
		.when('User searches the list for "$query"', async function (query) {
			this.owner.lookup(`controller:app.${module}.index`).set('query', query);
			await settled();
		})
		.when('User clicks the list button "$button"', async function (button) {
			await click(`[data-btn="${button}-${module}s"]`);
		})
		.then('Row "$name" shows the status "$status"', function (name, status) {
			assert.equal(row(name).querySelector(`[data-${module}-field="status"]`).textContent.trim(), status, `${name} shows ${status}`);
		})
		.then('The list exported the rows "$names"', function (names) {
			let ids = names.split(',').map((name) => row(name.trim()).dataset[`${module}Id`]);
			assert.equal(downloads.length, 1, 'one file was downloaded');
			assert.deepEqual(lastDownload().searchParams.get('ids').split(','), ids, `exported ${names}`);
		})
		.then('The list exported the search "$query"', function (query) {
			assert.equal(downloads.length, 1, 'one file was downloaded');
			assert.equal(lastDownload().searchParams.get('selectAll'), 'true', 'exported the whole search');
			assert.equal(lastDownload().searchParams.get('query'), query, `exported the search ${query}`);
		})
		.then('The list exported nothing and says "$message"', function (message) {
			assert.equal(downloads.length, 0, 'nothing was downloaded');
			// Messenger renders outside the test root, so search the whole document
			let errors = Array.from(document.querySelectorAll('.messenger-message.message-error .messenger-message-inner'));
			assert.ok(errors.some((el) => el.textContent.includes(message)), `the list says ${message}`);
		});
}

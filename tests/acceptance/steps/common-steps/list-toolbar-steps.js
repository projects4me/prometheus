/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { click, settled } from '@ember/test-helpers';

/**
 * Steps for the activate, deactivate and export buttons of a list's toolbar. Downloads are captured by
 * replacing the list controller's `download`, so the test page never navigates away.
 *
 * Lists on `<AppUi::ListToolbar>` and `<AppUi::DataTable>` pass `dataTest: true`: their rows, names, statuses and
 * buttons are found by `data-test-*` selectors. The others keep `data-<module>-id`, `data-<module>-field` and
 * `data-btn`.
 *
 * @param {Object} library the yadda library to extend
 * @param {Object} assert the QUnit assert
 * @param {String} module the list's module, e.g. `agent`
 * @param {Object} [options]
 * @param {Boolean} [options.dataTest] whether the list is built from the list-page parts
 * @return {Object} the library
 */
export default function listToolbarSteps(library, assert, module, { dataTest = false } = {}) {
	let downloads = [];
	const selectors = dataTest
		? {
				row: '[data-test-data-table-row]',
				field: (field) => `[data-test-${module}-${field}]`,
				button: (button) => `[data-test-list-action="${button}"]`,
				id: (el) => el.dataset.testDataTableRow,
			}
		: {
				row: `[data-${module}-id]`,
				field: (field) => `[data-${module}-field="${field}"]`,
				button: (button) => `[data-btn="${button}-${module}s"]`,
				id: (el) => el.dataset[`${module}Id`],
			};
	const row = (name) => Array.from(document.querySelectorAll(selectors.row)).find((el) => el.querySelector(selectors.field('name')).textContent.trim() === name);
	const lastDownload = () => new URL(downloads[downloads.length - 1], 'http://localhost');

	return library
		.given('Downloads of the list are captured', function () {
			downloads = [];
			this.owner.lookup(`controller:app.${module}.index`).download = (url) => downloads.push(url);
		})
		.when('User selects the row "$name"', async function (name) {
			await click(row(name).querySelector('input[type=checkbox], button[data-test-data-table-select]'));
		})
		.when('User searches the list for "$query"', async function (query) {
			this.owner.lookup(`controller:app.${module}.index`).set('query', query);
			await settled();
		})
		.when('User clicks the list button "$button"', async function (button) {
			await click(selectors.button(button));
		})
		.then('Row "$name" shows the status "$status"', function (name, status) {
			assert.equal(row(name).querySelector(selectors.field('status')).textContent.trim(), status, `${name} shows ${status}`);
		})
		.then('The list exported the rows "$names"', function (names) {
			let ids = names.split(',').map((name) => selectors.id(row(name.trim())));
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

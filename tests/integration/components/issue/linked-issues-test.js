/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

const ISSUES = {
	1: { id: '1', issueNumber: 1, projectId: 'p1', projectShortcode: 'APROM', subject: 'Main', status: 'new', priority: 'medium' },
	2: { id: '2', issueNumber: 2, projectId: 'p1', projectShortcode: 'APROM', subject: 'Parent issue', status: 'new', priority: 'medium' },
	3: { id: '3', issueNumber: 3, projectId: 'p1', projectShortcode: 'APROM', subject: 'Child issue', status: 'new', priority: 'medium' },
	4: { id: '4', issueNumber: 4836, projectId: 'p2', projectShortcode: 'AGAIA', subject: 'Blocker', status: 'new', priority: 'high', endDate: '2026-10-13' },
	5: { id: '5', issueNumber: 5, projectId: 'p1', projectShortcode: 'APROM', subject: 'Deeper blocker', status: 'new', priority: 'low' },
	6: { id: '6', issueNumber: 6, projectId: 'p1', projectShortcode: 'APROM', subject: 'Related issue', status: 'new', priority: 'low' },
};

const row = (relation, issue, depth = 1, via = null, path = ['1']) => ({
	issue: ISSUES[issue],
	link: null,
	relation,
	depth,
	via: via ? ISSUES[via] : null,
	path: [...path, String(issue)],
});

const EMPTY = { parent: [], blockedBy: [], splitFrom: [], children: [], splitInto: [], blocks: [], relates: [] };

module('Integration | Component | issue/linked-issues', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		let test = this;
		test.groups = { ...EMPTY };
		test.next = {};
		test.nextCalls = [];
		test.owner.register(
			'service:issue-relations',
			class extends Service {
				async load() {
					if (test.loadError) {
						throw new Error('load failed');
					}
					return test.groups;
				}
				async loadNext(r) {
					test.nextCalls.push(r.issue.id);
					let result = test.next[r.issue.id];
					if (result instanceof Error) {
						throw result;
					}
					return result || [];
				}
			}
		);
		test.set('issue', ISSUES[1]);
	});

	const headings = (el) => [...el.querySelectorAll('[data-test-data-table-group]')].map((g) => g.dataset.testDataTableGroup);

	test('groups are in chain order with the current issue between them, empty groups hidden', async function (assert) {
		this.groups = {
			...EMPTY,
			parent: [row('parent', 2)],
			blockedBy: [row('blockedBy', 4)],
			children: [row('children', 3)],
			relates: [row('relates', 6)],
		};
		await render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);

		assert.deepEqual(headings(this.element), ['parent', 'blockedBy', 'children', 'relates']);
		let order = [...this.element.querySelectorAll('[data-test-data-table-group], [data-test-data-table-row]')].map((el) =>
			el.matches('[data-test-data-table-group]') ? el.dataset.testDataTableGroup : el.dataset.testDataTableRow === '1' ? 'current' : 'row'
		);
		assert.deepEqual(order, ['parent', 'row', 'blockedBy', 'row', 'current', 'children', 'row', 'relates', 'row']);
		assert.dom('[data-test-data-table-group="children"] [data-test-data-table-group-count]').hasText('1');
		assert.dom('[data-test-linked-issue-current]').hasText('this issue');
		assert.dom('[data-test-data-table-row="1"] a').doesNotExist('the current row is not a link');
		assert.dom('[data-test-data-table-group="parent"] .fa-arrow-up').exists();
		assert.dom('[data-test-data-table-group="children"] .fa-arrow-down').exists();
		assert.dom('[data-test-data-table-group="relates"] .fa-arrows-h').exists();
	});

	test('a cross-project issue shows code-number, an issue of the project #number', async function (assert) {
		this.groups = { ...EMPTY, blockedBy: [row('blockedBy', 4)], children: [row('children', 3)] };
		await render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);

		assert.dom('[data-test-linked-issue="4"] a').hasText('agaia-4836');
		assert.dom('[data-test-linked-issue="3"] a').hasText('#3');
	});

	test('expanding a row loads the next level under it, indented, and collapsing removes it', async function (assert) {
		this.groups = { ...EMPTY, blockedBy: [row('blockedBy', 4)] };
		this.next = { 4: [row('blockedBy', 5, 2, 4, ['1', '4'])] };
		await render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);

		await click('[data-test-data-table-row="blockedBy:1>4"] [data-test-data-table-toggle]');

		assert.deepEqual(this.nextCalls, ['4']);
		assert.dom('[data-test-linked-issue="5"]').exists();
		assert.dom('[data-test-data-table-row="blockedBy:1>4>5"] [data-test-linked-issue-sub]').hasText('blocks agaia-4836');
		assert.dom('[data-test-data-table-row="blockedBy:1>4>5"] td').hasClass('data-table-depth-2');

		await click('[data-test-data-table-row="blockedBy:1>4"] [data-test-data-table-toggle]');
		assert.dom('[data-test-linked-issue="5"]').doesNotExist('collapsing removes the rows under it');
		assert.dom('[data-test-data-table-row="blockedBy:1>4"] [data-test-data-table-toggle]').hasAttribute('aria-expanded', 'false');
	});

	test('a row with nothing more loses its caret', async function (assert) {
		this.groups = { ...EMPTY, children: [row('children', 3)] };
		await render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);

		await click('[data-test-data-table-toggle]');

		assert.dom('[data-test-data-table-toggle]').doesNotExist();
	});

	test('relates rows are not expandable', async function (assert) {
		this.groups = { ...EMPTY, relates: [row('relates', 6)] };
		await render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);

		assert.dom('[data-test-data-table-toggle]').doesNotExist();
	});

	test('a failed load shows a row error and the caret again', async function (assert) {
		this.groups = { ...EMPTY, blocks: [row('blocks', 4)] };
		this.next = { 4: new Error('boom') };
		await render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);

		await click('[data-test-data-table-toggle]');

		assert.dom('[data-test-linked-issue-error]').exists();
		assert.dom('[data-test-data-table-toggle]').exists().isNotDisabled();

		this.next = { 4: [row('blocks', 5, 2, 4, ['1', '4'])] };
		await click('[data-test-data-table-toggle]');
		assert.dom('[data-test-linked-issue-error]').doesNotExist('a retry clears the error');
		assert.dom('[data-test-linked-issue="5"]').exists();
	});

	test('the loop guard of the service is respected: rows come from the service as given', async function (assert) {
		this.groups = { ...EMPTY, blocks: [row('blocks', 4)] };
		this.next = { 4: [] };
		await render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);

		await click('[data-test-data-table-toggle]');

		assert.dom('[data-test-linked-issue="1"]').exists({ count: 1 }, 'the current issue is listed once');
		assert.dom('[data-test-data-table-row]').exists({ count: 2 });
	});

	test('shows the empty state when there are no relations', async function (assert) {
		await render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);

		assert.dom('[data-test-linked-issues-empty]').containsText('No linked issues');
		assert.dom('[data-test-data-table]').doesNotExist();
	});

	test('shows a spinner while loading', async function (assert) {
		let release;
		this.owner.lookup('service:issue-relations').load = () => new Promise((resolve) => (release = () => resolve(EMPTY)));
		let rendering = render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);
		await new Promise((resolve) => setTimeout(resolve, 10));
		assert.dom('[data-test-linked-issues-loading]').exists();
		release();
		await rendering;
		await settled();
		assert.dom('[data-test-linked-issues-loading]').doesNotExist();
	});

	test('shows a message when the relations cannot be loaded', async function (assert) {
		this.loadError = true;
		await render(hbs`<Issue::LinkedIssues @issue={{this.issue}} />`);

		assert.dom('[data-test-linked-issues]').containsText('could not be loaded');
	});
});

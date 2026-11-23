/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, waitUntil, fillIn, focus, blur, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import AclStub from '../../stub-services/acl-stub';
import { issueQuerySchema } from '../../../helpers/query-schema';

const INPUT = '[data-field="ez-search-input"] input, input[data-field="ez-search-input"]';

const issue = (id, subject, extra = {}) => ({
	id: String(id),
	issueNumber: Number(id),
	projectId: 'p1',
	projectShortcode: 'APROM',
	subject,
	status: 'new',
	assignedTo: { id: 'u1', name: 'Ann Lee' },
	...extra
});

const ISSUES = [issue(2, 'Second'), issue(3, 'Third'), issue(4, 'Fourth', { projectId: 'p2', projectShortcode: 'AGAIA' })];

module('Integration | Component | issue/link-issue-modal', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		let test = this;
		test.queries = [];
		test.linkCalls = [];
		test.refusals = {};
		test.changed = 0;
		test.closed = 0;
		test.owner.register('service:acl', AclStub);
		test.owner.register(
			'service:store',
			class extends Service {
				async query(model, options) {
					test.queries.push(options);
					if (options.limit === -1) {
						return ISSUES;
					}
					let match = (options.query.match(/Issue\.subject CONTAINS ([^)]+)\)/) || [])[1];
					return ISSUES.filter((item) => !match || item.subject.toLowerCase().includes(match.toLowerCase().replace(/['"]/g, '')));
				}
				peekRecord() {
					return { id: 'p1', workspaceId: 'w1' };
				}
				peekAll() {
					return [
						{ id: 'p1', workspaceId: 'w1' },
						{ id: 'p2', workspaceId: 'w1' },
						{ id: 'p3', workspaceId: 'w2' }
					];
				}
			}
		);
		test.owner.register(
			'service:query-schema',
			class extends Service {
				async load() {
					return issueQuerySchema();
				}
			}
		);
		test.owner.register(
			'service:issue-relations',
			class extends Service {
				async load() {
					return { blocks: [{ issue: { id: '9' } }] };
				}
				async linkMany(source, rows) {
					test.linkCalls.push(rows.map((row) => `${row.target.id}:${row.relation}`));
					return rows.map((row) => ({ target: row.target, relation: row.relation, error: test.refusals[row.target.id] || null }));
				}
			}
		);
		test.set('issue', { id: '1', issueNumber: 1, projectId: 'p1', parentId: null });
		test.set('onChange', () => test.changed++);
		test.set('onClose', () => test.closed++);
	});

	async function show() {
		await render(hbs`<Issue::LinkIssueModal @issue={{this.issue}} @onChange={{this.onChange}} @onClose={{this.onClose}} />`);
	}

	const tick = (id) => click(`[data-test-link-issue-results] [data-select="${id}"]`);
	const rowIds = (el) => [...el.querySelectorAll('[data-test-link-issue-row]')].map((row) => row.dataset.testLinkIssueRow);
	const pick = async (id, label) => {
		await click(`[data-test-link-issue-row="${id}"] .ember-power-select-trigger`);
		await click(findAll('.ember-power-select-option').find((option) => option.textContent.trim() === label));
	};
	const relationOf = (el, id) => el.querySelector(`[data-test-link-issue-row="${id}"] .ember-power-select-selected-item`)?.textContent.trim();

	test('no info icons are rendered and the title names the issue', async function (assert) {
		await show();
		assert.dom('.fa-info-circle').doesNotExist();
		assert.dom('.modal-title').hasText('Link issues to #1');
		assert.dom('[data-test-link-issue-modal]').hasClass('link-issue-modal');
	});

	test('the first search shows the most recent issues of the workspace, without this and the linked ones', async function (assert) {
		await show();
		let first = this.queries.find((options) => options.limit === 10);
		assert.strictEqual(first.sort, 'Issue.dateModified');
		assert.strictEqual(first.order, 'DESC');
		assert.strictEqual(first.rels, 'assignedTo');
		assert.ok(first.query.includes('(Issue.projectId : p1)'), 'workspace project 1');
		assert.ok(first.query.includes('(Issue.projectId : p2)'), 'workspace project 2');
		assert.notOk(first.query.includes('p3'), 'other workspaces are left out');
		assert.ok(first.query.includes('(Issue.id !: 1)'), 'this issue is left out');
		assert.ok(first.query.includes('(Issue.id !: 9)'), 'the linked issue is left out');
		assert.dom('[data-test-data-table-row]').exists({ count: 3 });
		assert.dom('[data-test-link-issue-result="4"]').containsText('agaia-4');
		assert.dom('[data-test-link-issue-result="2"]').containsText('#2');
		assert.dom('[data-test-link-issue-count]').hasText('3 of 3 issues in the workspace');
	});

	test('a search applies the base query', async function (assert) {
		await show();
		this.queries = [];
		await focus(INPUT);
		await fillIn(INPUT, 'Third');
		await blur(INPUT);
		await click('[data-ez-search-apply]');
		let search = this.queries.find((options) => options.limit === 10);
		assert.ok(search.query.includes('(Issue.projectId : p1)'), 'base query kept');
		assert.ok(search.query.includes('(Issue.id !: 1)'), 'this issue stays left out');
		assert.ok(search.query.includes('Third'), 'with the typed text');
		assert.dom('[data-test-data-table-row]').exists({ count: 1 });
	});

	test('selecting adds rows, the selection survives a new search and × unticks', async function (assert) {
		await show();
		await tick(2);
		await tick(3);
		assert.deepEqual(rowIds(this.element), ['2', '3']);
		await focus(INPUT);
		await fillIn(INPUT, 'Fourth');
		await blur(INPUT);
		await click('[data-ez-search-apply]');
		assert.deepEqual(rowIds(this.element), ['2', '3'], 'rows kept after a new search');
		await click('[data-ez-search-clear]');
		assert.dom('[data-test-link-issue-results] [data-select="2"] .fa-check-square').exists('still ticked');
		await click('[data-test-link-issue-remove="2"]');
		assert.deepEqual(rowIds(this.element), ['3']);
		assert.dom('[data-test-link-issue-results] [data-select="2"] .fa-square-o').exists('unticked');
		assert.dom('[data-btn="save"]').hasText('Link 1 issue');
	});

	test('relations: the first row relates, new rows carry the last one picked', async function (assert) {
		await show();
		assert.dom('[data-btn="save"]').isDisabled();
		await tick(2);
		assert.strictEqual(relationOf(this.element, 2), 'relates to');
		await pick(2, 'blocks');
		await tick(3);
		assert.strictEqual(relationOf(this.element, 3), 'blocks');
	});

	test('"is child of" is offered on one row only', async function (assert) {
		await show();
		await tick(2);
		await tick(3);
		await pick(2, 'is child of');
		await click('[data-test-link-issue-row="3"] .ember-power-select-trigger');
		let options = findAll('.ember-power-select-option').map((option) => option.textContent.trim());
		assert.notOk(options.includes('is child of'), 'taken by the other row');
		assert.ok(options.includes('is parent of'));
		await click('[data-test-link-issue-row="3"] .ember-power-select-trigger');
		await tick(4);
		assert.strictEqual(relationOf(this.element, 4), 'relates to', 'a new row does not start with a taken relation');
	});

	test('"is child of" is not offered when the issue already has a parent', async function (assert) {
		this.set('issue', { id: '1', issueNumber: 1, projectId: 'p1', parentId: '7' });
		await show();
		await tick(2);
		await click('[data-test-link-issue-row="2"] .ember-power-select-trigger');
		let options = findAll('.ember-power-select-option').map((option) => option.textContent.trim());
		assert.notOk(options.includes('is child of'));
		assert.strictEqual(options.length, 6);
	});

	test('a mixed save keeps the refused row with its message and the modal open', async function (assert) {
		this.refusals = { 3: { errors: [{ detail: 'It would make a cycle' }] } };
		await show();
		await tick(2);
		await tick(3);
		await click('[data-btn="save"]');
		assert.deepEqual(this.linkCalls, [['2:relates', '3:relates']]);
		assert.deepEqual(rowIds(this.element), ['3']);
		assert.dom('[data-test-link-issue-row="3"] [data-test-link-issue-error]').hasText('It would make a cycle').hasClass('text-red');
		assert.dom('[data-test-link-issue-modal]').exists('still open');
		assert.strictEqual(this.changed, 1, 'the box refreshes');
		assert.strictEqual(this.closed, 0);
	});

	test('a full success closes the modal and calls onChange', async function (assert) {
		await show();
		await tick(2);
		await click('[data-btn="save"]');
		await waitUntil(() => this.closed === 1);
		assert.strictEqual(this.changed, 1);
		assert.strictEqual(this.closed, 1, 'the modal closed');
	});
});

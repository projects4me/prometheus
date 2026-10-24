import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

module('Integration | Component | issue/assignee-select', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.originalMessenger = window.Messenger;
		window.Messenger = function () {
			return { post: () => ({ update() {} }) };
		};

		const user = (id, name, accountStatus = 'active') =>
			EmberObject.create({ id, name, accountStatus });
		this.alice = user('1', 'Alice');
		this.bob = user('2', 'Bob');
		this.carol = user('3', 'Carol', 'inactive');
		this.members = [this.alice, this.bob, this.carol];
		this.saved = 0;
		this.issue = EmberObject.create({
			assignedTo: this.alice,
			assignee: '1',
			save: () => {
				this.saved++;
				return Promise.resolve();
			},
			rollbackAttributes() {
				this.set('assignedTo', this.oldAssignee);
			},
		});
	});

	hooks.afterEach(function () {
		window.Messenger = this.originalMessenger;
	});

	test('it lists active members except the current assignee', async function (assert) {
		await render(hbs`<Issue::AssigneeSelect @issue={{this.issue}} @members={{this.members}} />`);

		assert.dom('[data-issue-assignee]').hasText('Alice');
		assert.dom('[data-issue-assignee-option]').exists({ count: 1 });
		assert.dom('[data-issue-assignee-option]').hasText('Bob');
	});

	test('it saves the chosen member and calls @onUpdated', async function (assert) {
		let updated = null;
		this.onUpdated = (issue) => (updated = issue);

		await render(hbs`<Issue::AssigneeSelect @issue={{this.issue}} @members={{this.members}} @onUpdated={{this.onUpdated}} />`);
		await click('[data-issue-assignee-option]');

		assert.equal(this.saved, 1, 'issue was saved');
		assert.equal(this.issue.assignee, '2');
		assert.equal(this.issue.assignedTo, this.bob);
		assert.strictEqual(updated, this.issue, '@onUpdated received the issue');
	});

	test('it rolls back when saving fails', async function (assert) {
		this.issue.oldAssignee = this.alice;
		this.issue.save = () => Promise.reject(new Error('fail'));

		await render(hbs`<Issue::AssigneeSelect @issue={{this.issue}} @members={{this.members}} />`);
		await click('[data-issue-assignee-option]');

		assert.equal(this.issue.assignedTo, this.alice, 'assignee rolled back');
	});

	test('compact mode renders the avatar trigger and a right aligned menu', async function (assert) {
		await render(hbs`<Issue::AssigneeSelect @issue={{this.issue}} @members={{this.members}} @compact={{true}} />`);

		assert.dom('[data-issue-assignee-toggle] img').exists();
		assert.dom('[data-issue-assignee]').doesNotExist();
		assert.dom('.dropdown-menu').hasClass('dropdown-menu-right');
	});
});

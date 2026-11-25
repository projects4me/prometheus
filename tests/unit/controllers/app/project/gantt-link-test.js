import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Controller | app/project/gantt link picker', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.calls = [];
		this.failWith = null;
		let test = this;
		this.owner.register('service:issue-relations', class extends Service {
			async link(source, relation, target) {
				test.calls.push([source, relation, target]);
				if (test.failWith) {
					throw test.failWith;
				}
				return { id: 'l1' };
			}
		});
		this.controller = this.owner.lookup('controller:app/project/gantt');
		this.added = [];
		this.controller.links = { add: (link) => this.added.push(link) };
		this.a = { id: '1', issueNumber: 1, parentId: null };
		this.b = { id: '2', issueNumber: 2, parentId: null };
		this.posted = [];
		this.originalMessenger = window.Messenger;
		let posted = this.posted;
		window.Messenger = function () {
			this.post = (options) => posted.push(options);
		};
	});

	hooks.afterEach(function () {
		window.Messenger = this.originalMessenger;
	});

	test('a drop opens the picker and changes nothing', function (assert) {
		this.controller.createDependency(this.a, this.b, { x: 5, y: 6 });

		assert.deepEqual(this.controller.linkPicker, { source: this.a, target: this.b, x: 5, y: 6 });
		assert.deepEqual(this.calls, []);
		assert.strictEqual(this.b.parentId, null);
	});

	test('choosing a relation links through issueRelations.link and draws the link', async function (assert) {
		this.controller.createDependency(this.a, this.b, {});
		await this.controller.saveLink('splitsInto');

		assert.deepEqual(this.calls, [[this.a, 'splitsInto', this.b]]);
		assert.deepEqual(this.added, [{ id: 'l1' }]);
		assert.strictEqual(this.controller.linkPicker, null);
		assert.strictEqual(this.b.parentId, null, 'parentId is untouched');
	});

	test('a 422 shows Gaia\'s message', async function (assert) {
		this.failWith = { errors: [{ detail: 'This would create a cycle' }] };
		this.controller.createDependency(this.a, this.b, {});
		await this.controller.saveLink('blocks');

		assert.strictEqual(this.posted.length, 1);
		assert.strictEqual(this.posted[0].message, 'This would create a cycle');
		assert.strictEqual(this.posted[0].type, 'error');
		assert.deepEqual(this.added, []);
	});

	test('cancelling closes the picker', function (assert) {
		this.controller.createDependency(this.a, this.b, {});
		this.controller.cancelLinkPicker();

		assert.strictEqual(this.controller.linkPicker, null);
	});
});

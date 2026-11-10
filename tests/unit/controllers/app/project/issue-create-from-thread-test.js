/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | app/project/issue/create from a thread', function (hooks) {
	setupTest(hooks);

	test('after the save the thread is linked to the issue', async function (assert) {
		let controller = this.owner.lookup('controller:app/project/issue/create');
		let thread = { id: '7', save: async () => assert.step('save') };
		let issue = { id: '12', issueNumber: '345' };
		controller.sourceThread = thread;

		await controller.afterSave(issue);

		assert.verifySteps(['save']);
		assert.strictEqual(thread.issueId, '12');
		assert.strictEqual(thread.issueNumber, '345');
		assert.strictEqual(thread.issue, issue);
	});

	test('a failed thread save rolls the thread back and rethrows', async function (assert) {
		let controller = this.owner.lookup('controller:app/project/issue/create');
		let thread = {
			id: '7',
			save: async () => { throw new Error('denied'); },
			rollbackAttributes: () => assert.step('rollback')
		};
		controller.sourceThread = thread;

		await assert.rejects(controller.afterSave({ id: '12', issueNumber: '345' }), /denied/);
		assert.verifySteps(['rollback']);
		assert.notOk(thread.issue, 'the relationship is not set');
	});

	test('without a source thread nothing is linked', async function (assert) {
		let controller = this.owner.lookup('controller:app/project/issue/create');
		controller.sourceThread = null;
		await controller.afterSave({ id: '12' });
		assert.ok(true, 'no error');
	});
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

/**
 * A store stub holding projects and workspaces by id; findRecord resolves from `remote` and counts its calls.
 */
class StoreStub extends Service {
	projects = {};
	workspaces = {};
	remote = {};
	findCalls = [];

	peekRecord(type, id) {
		return (type === 'project' ? this.projects : this.workspaces)[id] ?? null;
	}

	async findRecord(type, id) {
		this.findCalls.push(`${type}:${id}`);
		if (!this.remote[id]) {
			throw new Error('not found');
		}
		return this.remote[id];
	}
}

module('Unit | Service | tracked-project', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		sessionStorage.removeItem('projectId');
		this.owner.register('service:store', StoreStub);
		this.store = this.owner.lookup('service:store');
		this.store.projects = {
			1: { id: '1', shortCode: 'APROM', workspaceId: 'w1' },
			2: { id: '2', shortCode: 'AGAIA', workspaceId: 'w2' },
			3: { id: '3', shortCode: 'NOWS', workspaceId: null }
		};
		this.service = this.owner.lookup('service:tracked-project');
	});

	hooks.afterEach(function () {
		sessionStorage.removeItem('projectId');
	});

	test('it exposes the workspace short code of the selected project from the store', async function (assert) {
		this.store.workspaces = { w1: { id: 'w1', shortCode: 'AGW' } };

		this.service.setProjectId('1');
		await this.service.loadWorkspace();

		assert.strictEqual(this.service.workspaceShortCode, 'agw');
		assert.deepEqual(this.store.findCalls, [], 'a workspace already in the store is not fetched');
	});

	test('it fetches the workspace when it is not in the store', async function (assert) {
		this.store.remote = { w2: { id: 'w2', shortCode: 'GWS' } };

		this.service.setProjectId('2');
		await this.service.loadWorkspace();

		assert.strictEqual(this.service.workspaceShortCode, 'gws');
		assert.deepEqual(this.store.findCalls, ['workspace:w2']);
	});

	test('it follows the selected project when it changes', async function (assert) {
		this.store.workspaces = { w1: { id: 'w1', shortCode: 'AGW' }, w2: { id: 'w2', shortCode: 'GWS' } };

		this.service.setProjectId('1');
		await this.service.loadWorkspace();
		this.service.setProjectId('2');
		await this.service.loadWorkspace();

		assert.strictEqual(this.service.workspaceShortCode, 'gws');
	});

	test('it drops a workspace response that arrives after the project changed', async function (assert) {
		this.store.remote = { w2: { id: 'w2', shortCode: 'GWS' } };
		this.store.workspaces = { w1: { id: 'w1', shortCode: 'AGW' } };

		this.service.id = '2';
		let slow = this.service.loadWorkspace();
		this.service.setProjectId('1');
		await slow;
		await this.service.loadWorkspace();

		assert.strictEqual(this.service.workspaceShortCode, 'agw');
	});

	test('it has no workspace short code without a project, a workspace or a readable workspace', async function (assert) {
		assert.strictEqual(this.service.workspaceShortCode, undefined, 'no project');

		this.service.setProjectId('3');
		await this.service.loadWorkspace();
		assert.strictEqual(this.service.workspaceShortCode, undefined, 'project without a workspace');

		this.store.projects[3].workspaceId = 'missing';
		await this.service.loadWorkspace();
		assert.strictEqual(this.service.workspaceShortCode, undefined, 'workspace that cannot be loaded');
	});
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'prometheus/tests/helpers/session';

module('Unit | Model | workspace', function (hooks) {
	setupTest(hooks);
	setupMirage(hooks);

	test('declares its attributes and relationships', function (assert) {
		const store = this.owner.lookup('service:store');
		const Workspace = store.modelFor('workspace');

		['name', 'shortCode', 'description', 'projectCount', 'memberCount', 'createdUser', 'createdUserName', 'dateCreated', 'dateModified'].forEach((attr) => {
			assert.true(Workspace.attributes.has(attr), `has ${attr}`);
		});
		assert.strictEqual(Workspace.relationshipsByName.get('createdBy').type, 'user');
		assert.strictEqual(Workspace.relationshipsByName.get('projects').options.inverse, 'workspace');
	});

	test('store.query finds a workspace by short code on Mirage', async function (assert) {
		authenticateSession(this.owner);
		this.server.create('workspace', { name: 'Engineering', shortCode: 'ENG' });
		this.server.create('workspace', { name: 'Marketing', shortCode: 'MKT' });
		const store = this.owner.lookup('service:store');

		const result = await store.query('workspace', { query: '((Workspace.shortCode : MKT))' });

		assert.strictEqual(result.length, 1);
		assert.strictEqual(result.slice()[0].name, 'Marketing');
	});
});

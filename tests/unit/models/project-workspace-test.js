/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'prometheus/tests/helpers/session';

module('Unit | Model | project workspace', function (hooks) {
	setupTest(hooks);
	setupMirage(hooks);

	test('project has a workspaceId attribute and a workspace relation paired with workspace.projects', function (assert) {
		const store = this.owner.lookup('service:store');
		const Project = store.modelFor('project');

		assert.true(Project.attributes.has('workspaceId'));
		const meta = Project.relationshipsByName.get('workspace');
		assert.strictEqual(meta.type, 'workspace');
		assert.strictEqual(meta.options.inverse, 'projects');
	});

	test('project.workspace resolves against Mirage', async function (assert) {
		authenticateSession(this.owner);
		const workspace = this.server.create('workspace', { name: 'Engineering', shortCode: 'ENG' });
		const project = this.server.create('project', { workspaceId: workspace.id });
		const store = this.owner.lookup('service:store');

		const record = await store.findRecord('project', project.id);
		const loaded = await record.workspace;

		assert.strictEqual(loaded.shortCode, 'ENG');
	});
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Model | doc', function (hooks) {
	setupTest(hooks);
	setupMirage(hooks);

	test('it declares the Gaia doc fields and relationships', function (assert) {
		const store = this.owner.lookup('service:store');
		const Doc = store.modelFor('doc');
		['title', 'body', 'projectId', 'ownerId', 'locked', 'dateCreated', 'dateModified', 'createdUser', 'modifiedUser']
			.forEach(name => assert.true(Doc.attributes.has(name), name));
		assert.strictEqual(Doc.attributes.get('locked').type, 'boolean');
		assert.strictEqual(Doc.relationshipsByName.get('project').kind, 'belongsTo');
		assert.strictEqual(Doc.relationshipsByName.get('owner').type, 'user');
		assert.strictEqual(Doc.relationshipsByName.get('tag').kind, 'hasMany');
	});

	test('query, findRecord, save and destroyRecord work against Mirage', async function (assert) {
		const store = this.owner.lookup('service:store');
		this.server.create('project', { id: '7' });
		this.server.create('project', { id: '8' });
		this.server.create('doc', { projectId: '7' });
		this.server.create('doc', { projectId: '8' });

		const docs = await store.query('doc', { query: '((Doc.projectId : 7))', rels: 'owner,tag' });
		assert.strictEqual(docs.length, 1);
		const doc = docs.firstObject;
		assert.strictEqual((await doc.owner).constructor.modelName, 'user');
		assert.strictEqual((await doc.tag).length, 2);
		assert.strictEqual((await store.findRecord('doc', doc.id)).projectId, '7');

		const created = store.createRecord('doc', { title: 'New', body: 'Text', projectId: '7', locked: false });
		await created.save();
		assert.ok(created.id);
		assert.strictEqual(this.server.schema.docs.all().length, 3);

		await created.destroyRecord();
		assert.strictEqual(this.server.schema.docs.all().length, 2);
	});

	test('tagged rows relate to the doc', function (assert) {
		const doc = this.server.create('doc');
		const rows = this.server.schema.taggeds.where({ relatedTo: 'doc', relatedId: doc.id });
		assert.strictEqual(rows.length, 2);
	});

	test('an unknown doc is rejected and a deleted doc leaves no tagged rows', async function (assert) {
		const store = this.owner.lookup('service:store');
		await assert.rejects(store.findRecord('doc', 'missing'));

		const doc = this.server.create('doc');
		const loaded = await store.findRecord('doc', doc.id);
		await loaded.destroyRecord();
		assert.strictEqual(this.server.schema.taggeds.where({ relatedTo: 'doc', relatedId: doc.id }).length, 0);
	});
});

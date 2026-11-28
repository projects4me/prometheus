import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | doc', function (hooks) {
	setupTest(hooks);

	test('it serializes the doc under the application conventions', function (assert) {
		const store = this.owner.lookup('service:store');
		const record = store.createRecord('doc', { title: 'T', body: 'B', projectId: '3', locked: true });
		const json = record.serialize();
		assert.strictEqual(json.data.attributes.title, 'T');
		assert.strictEqual(json.data.attributes.projectId, '3');
		assert.true(json.data.attributes.locked);
	});

	test('it normalizes camelCase attributes and relationships from Gaia', function (assert) {
		const store = this.owner.lookup('service:store');
		const serializer = store.serializerFor('doc');
		const result = serializer.normalizeResponse(store, store.modelFor('doc'), {
			data: { id: '1', type: 'doc', attributes: { title: 'T', ownerId: '4', dateCreated: '2026-01-01' }, relationships: { owner: { data: { id: '4', type: 'user' } } } }
		}, '1', 'findRecord');
		assert.strictEqual(result.data.attributes.ownerId, '4');
		assert.strictEqual(result.data.relationships.owner.data.id, '4');
	});
});

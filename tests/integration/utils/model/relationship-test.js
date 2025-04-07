import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { getModelRelationships } from 'prometheus/utils/model/relationship';

module('Integration | Utility | model/relationship', function (hooks) {
	setupRenderingTest(hooks);

	test('getModelRelationships returns all relationships', async function (assert) {
		const store = this.owner.lookup('service:store');

		// Get all relationships
		const relationships = getModelRelationships('project', store);

		// Verify relationships are returned
		assert.ok(relationships.length > 0, 'Should return relationships');
		assert.ok(
			relationships.includes('owner'),
			'Should include belongsTo relationships'
		);
		assert.ok(
			relationships.includes('issues'),
			'Should include hasMany relationships'
		);
	});

	test('getModelRelationships filters by belongsTo relationships', async function (assert) {
		const store = this.owner.lookup('service:store');

		// Get only belongsTo relationships
		const belongsToRelationships = getModelRelationships(
			'project',
			store,
			'belongsTo'
		);

		// Verify only belongsTo relationships are returned
		assert.ok(
			belongsToRelationships.length > 0,
			'Should return belongsTo relationships'
		);
		assert.ok(
			belongsToRelationships.includes('owner'),
			'Should include owner relationship'
		);
		assert.notOk(
			belongsToRelationships.includes('issues'),
			'Should not include hasMany relationships'
		);
	});

	test('getModelRelationships filters by hasMany relationships', async function (assert) {
		const store = this.owner.lookup('service:store');

		// Get only hasMany relationships
		const hasManyRelationships = getModelRelationships(
			'project',
			store,
			'hasMany'
		);

		// Verify only hasMany relationships are returned
		assert.ok(
			hasManyRelationships.length > 0,
			'Should return hasMany relationships'
		);
		assert.ok(
			hasManyRelationships.includes('issues'),
			'Should include issues relationship'
		);
		assert.notOk(
			hasManyRelationships.includes('owner'),
			'Should not include belongsTo relationships'
		);
	});

	test('getModelRelationships returns translated relationships', async function (assert) {
		const store = this.owner.lookup('service:store');

		// Get translated relationships
		const translatedRelationships = getModelRelationships(
			'project',
			store,
			null,
			true
		);

		// Verify relationships are returned as objects with translated names
		assert.ok(
			translatedRelationships.length > 0,
			'Should return relationships'
		);
		assert.ok(
			translatedRelationships[0].name,
			'Relationships should include name property'
		);
		assert.ok(
			translatedRelationships[0].translatedName,
			'Relationships should include translatedName property'
		);
	});

	test('getModelRelationships returns filtered translated relationships', async function (assert) {
		const store = this.owner.lookup('service:store');

		// Get translated belongsTo relationships
		const translatedBelongsTo = getModelRelationships(
			'project',
			store,
			'belongsTo',
			true
		);

		// Verify only translated belongsTo relationships are returned
		assert.ok(
			translatedBelongsTo.length > 0,
			'Should return relationships'
		);
		const ownerRel = translatedBelongsTo.find(
			(rel) => rel.name === 'owner'
		);
		assert.ok(ownerRel, 'Should include owner relationship');
		assert.ok(
			ownerRel.translatedName,
			'Should include translated name for owner'
		);
	});
});

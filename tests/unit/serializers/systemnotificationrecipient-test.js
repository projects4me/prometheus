import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | systemnotificationrecipient', function (hooks) {
	setupTest(hooks);

	function isReadAfterPush(store, id, isRead) {
		store.push(
			store.normalize('systemnotificationrecipient', {
				type: 'systemnotificationrecipient',
				id,
				attributes: { userId: '1', isRead }
			})
		);
		return store.peekRecord('systemnotificationrecipient', id).isRead;
	}

	test('isRead becomes the string 0 or 1 whatever form Gaia sends', function (assert) {
		const store = this.owner.lookup('service:store');
		assert.strictEqual(isReadAfterPush(store, 'a', 0), '0', 'number 0');
		assert.strictEqual(isReadAfterPush(store, 'b', 1), '1', 'number 1');
		assert.strictEqual(isReadAfterPush(store, 'c', '0'), '0', 'string 0');
		assert.strictEqual(isReadAfterPush(store, 'd', '1'), '1', 'string 1');
		assert.strictEqual(isReadAfterPush(store, 'e', false), '0', 'false');
		assert.strictEqual(isReadAfterPush(store, 'f', true), '1', 'true');
	});

	test('a missing isRead stays missing', function (assert) {
		const store = this.owner.lookup('service:store');
		assert.strictEqual(isReadAfterPush(store, 'g', null), null);
	});
});

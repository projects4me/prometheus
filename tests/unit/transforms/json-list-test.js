import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | json-list', function (hooks) {
    setupTest(hooks);

    test('it parses JSON text into a list', function (assert) {
        const transform = this.owner.lookup('transform:json-list');
        assert.deepEqual(transform.deserialize('[{"key":"a","version":1}]'), [{ key: 'a', version: 1 }]);
        assert.deepEqual(transform.deserialize([{ key: 'a' }]), [{ key: 'a' }]);
    });

    test('null, empty, invalid and non-list values give an empty list', function (assert) {
        const transform = this.owner.lookup('transform:json-list');
        [null, undefined, '', '  ', 'not json', '{"a":1}', 5].forEach((value) => {
            assert.deepEqual(transform.deserialize(value), [], `${value}`);
        });
    });

    test('it serializes lists as JSON text', function (assert) {
        const transform = this.owner.lookup('transform:json-list');
        assert.strictEqual(transform.serialize([{ key: 'a' }]), '[{"key":"a"}]');
        assert.strictEqual(transform.serialize(null), '[]');
    });
});

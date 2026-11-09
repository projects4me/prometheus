import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | agent delegationScopes', function (hooks) {
    setupTest(hooks);

    test('delegationScopes is a json-list attribute, so JSON text from Gaia becomes a list', function (assert) {
        const store = this.owner.lookup('service:store');
        const meta = store.modelFor('agent').attributes.get('delegationScopes');
        assert.strictEqual(meta.type, 'json-list');
        const transform = this.owner.lookup(`transform:${meta.type}`);
        assert.deepEqual(transform.deserialize('["issue.*","custom.thing"]'), ['issue.*', 'custom.thing']);
    });
});

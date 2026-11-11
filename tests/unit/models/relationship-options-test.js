/* global requirejs */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

/**
 * Names of all models defined under app/models.
 *
 * @return {Array<String>}
 */
function modelNames() {
    const prefix = 'prometheus/models/';
    return Object.keys(requirejs.entries)
        .filter((name) => name.startsWith(prefix))
        .map((name) => name.slice(prefix.length));
}

module('Unit | Model | relationship options', function (hooks) {
    setupTest(hooks);

    test('every relationship declares a boolean async and an explicit inverse', function (assert) {
        const store = this.owner.lookup('service:store');
        const missing = [];

        modelNames().forEach((modelName) => {
            store.modelFor(modelName).relationshipsByName.forEach((meta, name) => {
                const { options } = meta;
                if (typeof options.async !== 'boolean' || options.inverse === undefined) {
                    missing.push(`${modelName}.${name}`);
                }
            });
        });

        assert.deepEqual(missing, [], 'relationships without explicit async and inverse');
    });

    test('every named inverse points back at the relationship that names it', function (assert) {
        const store = this.owner.lookup('service:store');
        const mismatched = [];

        modelNames().forEach((modelName) => {
            store.modelFor(modelName).relationshipsByName.forEach((meta, name) => {
                const inverse = meta.options.inverse;
                if (!inverse) {
                    return;
                }
                const inverseMeta = store.modelFor(meta.type).relationshipsByName.get(inverse);
                if (!inverseMeta || inverseMeta.type !== modelName || inverseMeta.options.inverse !== name) {
                    mismatched.push(`${modelName}.${name} -> ${meta.type}.${inverse}`);
                }
            });
        });

        assert.deepEqual(mismatched, [], 'inverse pairs that do not match');
    });
});

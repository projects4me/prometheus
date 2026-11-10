import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

/** Flattens the nested translations into `key → message` pairs. */
function flatten(node, prefix = '', out = {}) {
	for (let [key, value] of Object.entries(node)) {
		let path = prefix ? `${prefix}.${key}` : key;
		if (value !== null && typeof value === 'object') {
			flatten(value, path, out);
		} else {
			out[path] = value;
		}
	}
	return out;
}

/** Sample values for every placeholder (`{name}`, `{n, plural, …}`) of a message. */
function sampleValues(message) {
	let values = {};
	for (let [, name, type] of String(message).matchAll(/\{\s*([A-Za-z_]\w*)\s*(?:,\s*(\w+))?/g)) {
		values[name] = type === 'plural' || type === 'number' ? 2 : name === 'locale' ? 'en-us' : 'sample';
	}
	return values;
}

module('Unit | Translations | bundle', function (hooks) {
	setupTest(hooks);

	test('every message in translations/*.json formats', function (assert) {
		let intl = this.owner.lookup('service:intl');
		let messages = flatten(intl.translationsFor('en-us'));
		let keys = Object.keys(messages);

		assert.ok(keys.length > 100, `found ${keys.length} messages`);
		for (let key of keys) {
			try {
				let result = intl.t(key, sampleValues(messages[key]));
				assert.notStrictEqual(result, undefined, key);
			} catch (error) {
				assert.ok(false, `${key} does not format: ${error.message}`);
			}
		}
	});
});

import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import ArrayProxy from '@ember/array/proxy';
import { add } from 'prometheus/helpers/add';
import { sub } from 'prometheus/helpers/sub';
import { mult } from 'prometheus/helpers/mult';
import { findBy } from 'prometheus/helpers/find-by';
import { call } from 'prometheus/helpers/call';
import { includes } from 'prometheus/helpers/includes';
import { join } from 'prometheus/helpers/join';
import { inc } from 'prometheus/helpers/inc';
import { slice } from 'prometheus/helpers/slice';
import { queue } from 'prometheus/helpers/queue';
import { optional } from 'prometheus/helpers/optional';
import { keys } from 'prometheus/helpers/keys';
import { noop } from 'prometheus/helpers/noop';
import { lowercase } from 'prometheus/helpers/lowercase';
import { dasherize } from 'prometheus/helpers/dasherize';
import { momentFromNow } from 'prometheus/helpers/moment-from-now';

module('Unit | Helpers | addon replacements', function () {
	test('math helpers take any number of arguments', function (assert) {
		assert.strictEqual(add([1, 2, 3]), 6);
		assert.strictEqual(sub([10, 3, 2]), 5);
		assert.strictEqual(mult([2, 3, 4]), 24);
	});

	test('find-by works on plain arrays, EmberObjects and proxies', function (assert) {
		const items = [EmberObject.create({ id: 1 }), EmberObject.create({ id: 2 })];
		assert.strictEqual(findBy(['id', 2, items]), items[1]);
		assert.strictEqual(findBy(['id', 2, ArrayProxy.create({ content: items })]), items[1]);
		assert.strictEqual(findBy(['id', 2, [{ id: 2 }]]).id, 2);
		assert.strictEqual(findBy(['id', 9, items]), undefined);
		assert.strictEqual(findBy(['id', 9, undefined]), undefined);
	});

	test('includes works on plain arrays and proxies', function (assert) {
		assert.true(includes(['a', ['a', 'b']]));
		assert.true(includes(['a', ArrayProxy.create({ content: ['a'] })]));
		assert.false(includes(['c', ['a']]));
		assert.false(includes(['c', undefined]));
	});

	test('call, queue, optional, noop', async function (assert) {
		assert.strictEqual(call([(a, b) => a + b, 1, 2]), 3);
		assert.strictEqual(call([undefined]), undefined);
		const order = [];
		await queue([() => order.push(1), async () => order.push(2)])();
		assert.deepEqual(order, [1, 2]);
		assert.strictEqual(optional([undefined])(), undefined);
		assert.strictEqual(typeof noop(), 'function');
	});

	test('join, inc, slice, keys', function (assert) {
		assert.strictEqual(join([', ', ['a', 'b']]), 'a, b');
		assert.strictEqual(inc([2]), 3);
		assert.strictEqual(inc([2, 5]), 7);
		assert.deepEqual(slice([1, 3, [1, 2, 3, 4]]), [2, 3]);
		assert.deepEqual(keys([{ a: 1, b: 2 }]), ['a', 'b']);
	});

	test('string and moment helpers', function (assert) {
		assert.strictEqual(lowercase(['AbC']), 'abc');
		assert.strictEqual(dasherize(['fooBar']), 'foo-bar');
		assert.strictEqual(momentFromNow([null]), '-');
		assert.ok(momentFromNow([new Date()]).length > 0);
	});
});

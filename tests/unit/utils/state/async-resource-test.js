/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import AsyncResource from 'prometheus/utils/state/async-resource';

/**
 * A load stub whose calls are resolved or rejected by hand
 */
function deferredLoad() {
	let calls = [];
	let load = (params) =>
		new Promise((resolve, reject) => {
			calls.push({ params, resolve, reject });
		});
	return { load, calls };
}

module('Unit | Utility | state/async-resource', function () {
	test('it starts empty', function (assert) {
		let r = new AsyncResource({ load: async () => 1 });
		assert.strictEqual(r.value, null);
		assert.strictEqual(r.error, null);
		assert.false(r.isLoading);
		assert.strictEqual(r.params, undefined);
	});

	test('run sets isLoading while the load runs and writes the value', async function (assert) {
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load });
		let done = r.run({ id: 1 });
		assert.true(r.isLoading);
		assert.deepEqual(calls[0].params, { id: 1 });
		calls[0].resolve('one');
		assert.strictEqual(await done, 'one');
		assert.false(r.isLoading);
		assert.strictEqual(r.value, 'one');
		assert.deepEqual(r.params, { id: 1 });
	});

	test('the newest call wins over a slower older one', async function (assert) {
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load });
		let first = r.run(1);
		let second = r.run(2);
		calls[1].resolve('two');
		assert.strictEqual(await second, 'two');
		assert.false(r.isLoading);
		calls[0].resolve('one');
		assert.strictEqual(await first, undefined);
		assert.strictEqual(r.value, 'two');
		assert.false(r.isLoading);
	});

	test('an older response does not clear isLoading of the newer call', async function (assert) {
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load });
		let first = r.run(1);
		r.run(2);
		calls[0].resolve('one');
		await first;
		assert.true(r.isLoading);
		assert.strictEqual(r.value, null);
	});

	test('an older error is dropped', async function (assert) {
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load });
		let first = r.run(1);
		let second = r.run(2);
		calls[1].resolve('two');
		await second;
		calls[0].reject(new Error('old'));
		await first;
		assert.strictEqual(r.error, null);
		assert.strictEqual(r.value, 'two');
	});

	test('an error keeps the previous value and is not thrown', async function (assert) {
		let fail = false;
		let error = new Error('boom');
		let r = new AsyncResource({
			load: async (id) => {
				if (fail) {
					throw error;
				}
				return `value ${id}`;
			}
		});
		await r.run(1);
		fail = true;
		assert.strictEqual(await r.run(2), undefined);
		assert.strictEqual(r.error, error);
		assert.strictEqual(r.value, 'value 1');
		assert.false(r.isLoading);
	});

	test('retry runs the last params again and clears the error', async function (assert) {
		let fail = true;
		let seen = [];
		let r = new AsyncResource({
			load: async (id) => {
				seen.push(id);
				if (fail) {
					throw new Error('boom');
				}
				return `value ${id}`;
			}
		});
		await r.run(7);
		assert.ok(r.error);
		fail = false;
		assert.strictEqual(await r.retry(), 'value 7');
		assert.deepEqual(seen, [7, 7]);
		assert.strictEqual(r.error, null);
		assert.strictEqual(r.value, 'value 7');
	});

	test('reset clears everything and drops a running load', async function (assert) {
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load });
		r.seed('old', 1);
		let running = r.run(2);
		r.reset();
		assert.false(r.isLoading);
		assert.strictEqual(r.value, null);
		assert.strictEqual(r.error, null);
		assert.strictEqual(r.params, undefined);
		calls[0].resolve('late');
		await running;
		assert.strictEqual(r.value, null);
		assert.false(r.isLoading);
	});

	test('seed sets a loaded value and drops a running load', async function (assert) {
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load });
		let running = r.run(1);
		r.seed('seeded', { id: 2 });
		assert.strictEqual(r.value, 'seeded');
		assert.deepEqual(r.params, { id: 2 });
		assert.false(r.isLoading);
		calls[0].resolve('late');
		await running;
		assert.strictEqual(r.value, 'seeded');
		r.retry();
		assert.deepEqual(calls[1].params, { id: 2 });
	});

	test('nothing is written after the owner is destroyed', async function (assert) {
		let owner = { isDestroying: false, isDestroyed: false };
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load, owner });
		let running = r.run(1);
		owner.isDestroying = true;
		calls[0].resolve('late');
		assert.strictEqual(await running, undefined);
		assert.strictEqual(r.value, null);
		assert.true(r.isLoading, 'the flag is left as it was');

		owner.isDestroyed = true;
		await r.run(2);
		assert.strictEqual(calls.length, 1, 'no load starts once the owner is gone');
		r.seed('x');
		r.reset();
		assert.strictEqual(r.value, null);
		assert.true(r.isLoading);
	});

	test('an error after the owner is destroyed is not written', async function (assert) {
		let owner = { isDestroyed: false };
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load, owner });
		let running = r.run(1);
		owner.isDestroyed = true;
		calls[0].reject(new Error('late'));
		await running;
		assert.strictEqual(r.error, null);
	});

	test('retry does nothing before any run or seed, and after a reset', async function (assert) {
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load });
		assert.strictEqual(await r.retry(), undefined);
		assert.strictEqual(calls.length, 0);
		assert.false(r.isLoading);
		r.seed('x', 1);
		r.reset();
		assert.strictEqual(await r.retry(), undefined);
		assert.strictEqual(calls.length, 0);
	});

	test('retry runs again after a run with undefined params', async function (assert) {
		let { load, calls } = deferredLoad();
		let r = new AsyncResource({ load });
		let first = r.run();
		calls[0].resolve('a');
		await first;
		r.retry();
		assert.strictEqual(calls.length, 2);
		assert.strictEqual(calls[1].params, undefined);
	});
});

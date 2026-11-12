/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import ListLoader from 'prometheus/utils/state/list-loader';
import { recordArray } from '../../../helpers/record-array';

/**
 * A query result like Ember Data's: an array of records with the response meta
 */
function page(records, next) {
	let result = [...records];
	result.meta = next ? { links: { next: '/api/v1/ideas?page=2' } } : { links: {} };
	return result;
}

/**
 * A store stub whose queries are resolved or rejected by hand
 */
function storeStub() {
	let calls = [];
	return {
		calls,
		query(modelName, options) {
			return new Promise((resolve, reject) => {
				calls.push({ modelName, options, resolve, reject });
			});
		}
	};
}

function loaderFor(store, owner) {
	return new ListLoader({
		store,
		owner,
		modelName: 'idea',
		pageSize: 2,
		buildRequest: ({ query, page }) => ({ query, page })
	});
}

module('Unit | Utility | state/list-loader', function () {
	test('it starts with no items and no next page', function (assert) {
		let loader = loaderFor(storeStub());
		assert.deepEqual(loader.items, []);
		assert.false(loader.hasNext);
		assert.false(loader.isLoading);
		assert.strictEqual(loader.error, null);
	});

	test('request adds the page size as a plain limit to buildRequest', function (assert) {
		let loader = loaderFor(storeStub());
		assert.deepEqual(loader.request({ query: 'a', page: 3 }), { query: 'a', page: 3, limit: 2 });
	});

	test('run queries the model with request(params) and exposes the page', async function (assert) {
		let store = storeStub();
		let loader = loaderFor(store);
		let done = loader.run({ query: 'x', page: 1 });
		assert.true(loader.isLoading);
		assert.strictEqual(store.calls[0].modelName, 'idea');
		assert.deepEqual(store.calls[0].options, { query: 'x', page: 1, limit: 2 });
		store.calls[0].resolve(page([{ id: 1 }, { id: 2 }], true));
		await done;
		assert.false(loader.isLoading);
		assert.deepEqual(loader.items, [{ id: 1 }, { id: 2 }]);
		assert.true(loader.hasNext);
	});

	test('hasNext is false on the last page', async function (assert) {
		let store = storeStub();
		let loader = loaderFor(store);
		let done = loader.run({ page: 2 });
		store.calls[0].resolve(page([{ id: 3 }], false));
		await done;
		assert.deepEqual(loader.items, [{ id: 3 }]);
		assert.false(loader.hasNext);
	});

	test('items copies the records of a record array', function (assert) {
		let loader = loaderFor(storeStub());
		loader.seed(recordArray(['a'], {}), { page: 1 });
		assert.deepEqual(loader.items, ['a']);
	});

	test('the newest page wins over a slower older one', async function (assert) {
		let store = storeStub();
		let loader = loaderFor(store);
		let first = loader.run({ page: 1 });
		let second = loader.run({ page: 2 });
		store.calls[1].resolve(page([{ id: 3 }], false));
		await second;
		store.calls[0].resolve(page([{ id: 1 }, { id: 2 }], true));
		await first;
		assert.deepEqual(loader.items, [{ id: 3 }]);
		assert.false(loader.hasNext);
		assert.deepEqual(loader.params, { page: 2 });
	});

	test('an error keeps the previous page and retry loads it again', async function (assert) {
		let store = storeStub();
		let loader = loaderFor(store);
		loader.seed(page([{ id: 1 }], true), { page: 1 });
		let failed = loader.run({ page: 2 });
		let error = new Error('boom');
		store.calls[0].reject(error);
		await failed;
		assert.strictEqual(loader.error, error);
		assert.deepEqual(loader.items, [{ id: 1 }]);
		let retried = loader.retry();
		assert.deepEqual(store.calls[1].options, { page: 2, query: undefined, limit: 2 });
		store.calls[1].resolve(page([{ id: 3 }], false));
		await retried;
		assert.strictEqual(loader.error, null);
		assert.deepEqual(loader.items, [{ id: 3 }]);
	});

	test('reset clears the page', function (assert) {
		let loader = loaderFor(storeStub());
		loader.seed(page([{ id: 1 }], true), { page: 1 });
		loader.reset();
		assert.deepEqual(loader.items, []);
		assert.false(loader.hasNext);
		assert.strictEqual(loader.params, undefined);
	});

	test('no page is written after the owner is destroyed', async function (assert) {
		let owner = { isDestroyed: false };
		let store = storeStub();
		let loader = loaderFor(store, owner);
		let running = loader.run({ page: 1 });
		owner.isDestroyed = true;
		store.calls[0].resolve(page([{ id: 1 }], true));
		await running;
		assert.deepEqual(loader.items, []);
	});

	test('items returns the same array until the page changes', async function (assert) {
		let store = storeStub();
		let loader = loaderFor(store);
		loader.seed(page([{ id: 1 }], true), { page: 1 });
		let items = loader.items;
		assert.strictEqual(loader.items, items);
		let next = loader.run({ page: 2 });
		store.calls[0].resolve(page([{ id: 2 }], false));
		await next;
		assert.notStrictEqual(loader.items, items);
		assert.deepEqual(loader.items, [{ id: 2 }]);
	});

	test('retry does nothing before any run or seed', async function (assert) {
		let store = storeStub();
		let loader = loaderFor(store);
		assert.strictEqual(await loader.retry(), undefined);
		assert.strictEqual(store.calls.length, 0);
	});

	test('seed then retry queries the seeded params', function (assert) {
		let store = storeStub();
		let loader = loaderFor(store);
		loader.seed(page([{ id: 1 }], true), { query: 'q', page: 1 });
		loader.retry();
		assert.deepEqual(store.calls[0].options, { query: 'q', page: 1, limit: 2 });
	});

	test('an error thrown by buildRequest lands in error', async function (assert) {
		let error = new Error('bad params');
		let loader = new ListLoader({
			store: storeStub(),
			modelName: 'idea',
			pageSize: 2,
			buildRequest: () => {
				throw error;
			}
		});
		assert.strictEqual(await loader.run({}), undefined);
		assert.strictEqual(loader.error, error);
		assert.false(loader.isLoading);
	});
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import ThreadCounts from 'prometheus/utils/conversation/thread-counts';
import { fetchRoomCounts } from 'prometheus/utils/conversation/room-counts';

const counts = (commentCount, agreeCount = 0, disagreeCount = 0) => ({ commentCount, agreeCount, disagreeCount });

module('Unit | Utility | conversation/thread-counts', function () {
	test('fetchRoomCounts asks for all rooms in one query', async function (assert) {
		let requests = [];
		let store = {
			query: async (model, params) => {
				requests.push([model, params]);
				return { toArray: () => [{ id: 'a', commentCount: '2', agreeCount: 1, disagreeCount: null }] };
			}
		};
		let result = await fetchRoomCounts(store, ['a', 'b']);
		assert.strictEqual(requests.length, 1);
		assert.strictEqual(requests[0][0], 'conversationroomcount');
		assert.strictEqual(requests[0][1].query, "(Conversationroomcount.id CONTAINS 'a','b')");
		assert.deepEqual(result, { a: counts(2, 1, 0) });
		assert.deepEqual(await fetchRoomCounts(store, []), {}, 'no rooms, no request');
		assert.strictEqual(requests.length, 1);
	});

	test('load fills the counts of every room with one fetch', async function (assert) {
		let calls = 0;
		let threadCounts = new ThreadCounts({
			fetch: async () => {
				calls++;
				return { a: counts(1, 1), b: counts(2) };
			}
		});
		await threadCounts.load(['a', 'b']);
		assert.strictEqual(calls, 1);
		assert.deepEqual(threadCounts.countsFor('a'), counts(1, 1));
		assert.strictEqual(threadCounts.countsFor('b').commentCount, 2);
	});

	test('the result of an older page is dropped when a newer page loads', async function (assert) {
		let pending = {};
		let threadCounts = new ThreadCounts({
			fetch: (roomIds) => new Promise((resolve) => (pending[roomIds[0]] = resolve))
		});
		let first = threadCounts.load(['old']);
		let second = threadCounts.load(['new']);
		pending.new({ new: counts(1) });
		pending.old({ old: counts(5) });
		await Promise.all([first, second]);
		assert.strictEqual(threadCounts.countsFor('old'), null, 'the stale page is dropped');
		assert.strictEqual(threadCounts.countsFor('new').commentCount, 1);
	});

	test('a failed fetch leaves the rows without counts', async function (assert) {
		let threadCounts = new ThreadCounts({ fetch: async () => Promise.reject(new Error('x')) });
		await threadCounts.load(['a']);
		assert.strictEqual(threadCounts.countsFor('a'), null);
	});

	test('live comments adjust a loaded room once', async function (assert) {
		let threadCounts = new ThreadCounts({ fetch: async () => ({ a: counts(1) }) });
		await threadCounts.load(['a']);
		threadCounts.addComment('a', '2', 'I agree');
		threadCounts.addComment('a', '2', 'I agree');
		threadCounts.addComment('other', '9', 'x');
		assert.deepEqual(threadCounts.countsFor('a'), counts(2, 1));
		threadCounts.removeComment('2', 'a', 'I agree');
		threadCounts.removeComment('2', 'a', 'I agree');
		assert.deepEqual(threadCounts.countsFor('a'), counts(1));
		assert.strictEqual(threadCounts.countsFor('other'), null);
	});
});

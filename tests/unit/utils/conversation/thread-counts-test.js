/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import ThreadCounts, { tallyComments } from 'prometheus/utils/conversation/thread-counts';

module('Unit | Utility | conversation/thread-counts', function () {
	test('tallyComments splits agree and disagree from all comments', function (assert) {
		let counts = tallyComments([
			{ id: '1', comment: 'I agree' },
			{ id: '2', comment: 'I agree' },
			{ id: '3', comment: 'I disagree' },
			{ id: '4', comment: 'hello' }
		]);
		assert.deepEqual(counts, { commentCount: 4, agreeCount: 2, disagreeCount: 1 });
	});

	test('load fills the counts of every room', async function (assert) {
		let threadCounts = new ThreadCounts({
			fetch: async (roomId) => (roomId === 'a' ? [{ id: '1', comment: 'I agree' }] : [{ id: '2', comment: 'x' }, { id: '3', comment: 'y' }])
		});
		await threadCounts.load(['a', 'b']);
		assert.deepEqual(threadCounts.countsFor('a'), { commentCount: 1, agreeCount: 1, disagreeCount: 0 });
		assert.strictEqual(threadCounts.countsFor('b').commentCount, 2);
	});

	test('the result of an older page is dropped when a newer page loads', async function (assert) {
		let pending = {};
		let threadCounts = new ThreadCounts({
			fetch: (roomId) => new Promise((resolve) => (pending[roomId] = resolve))
		});
		let first = threadCounts.load(['old']);
		let second = threadCounts.load(['new']);
		pending.old([{ id: '1', comment: 'x' }]);
		pending.new([{ id: '2', comment: 'y' }]);
		await Promise.all([first, second]);
		assert.strictEqual(threadCounts.countsFor('old'), null, 'the stale page is dropped');
		assert.strictEqual(threadCounts.countsFor('new').commentCount, 1);
	});

	test('live comments are counted once and removed again', async function (assert) {
		let threadCounts = new ThreadCounts({ fetch: async () => [{ id: '1', comment: 'x' }] });
		await threadCounts.load(['a']);
		threadCounts.addComment('a', '2', 'I agree');
		threadCounts.addComment('a', '2', 'I agree');
		threadCounts.addComment('other', '9', 'x');
		assert.deepEqual(threadCounts.countsFor('a'), { commentCount: 2, agreeCount: 1, disagreeCount: 0 });
		threadCounts.removeComment('2');
		assert.strictEqual(threadCounts.countsFor('a').commentCount, 1);
		assert.strictEqual(threadCounts.countsFor('other'), null);
	});
});

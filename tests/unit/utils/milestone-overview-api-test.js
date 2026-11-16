/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { fetchMilestoneOverviewsBulk } from 'prometheus/utils/milestone-overview-api';

module('Unit | Utility | milestone-overview-api', function () {
	test('it loads every overview in one bulk.query call', async function (assert) {
		let calls = [];
		let bulk = {
			async query(items) {
				calls.push(items);
				return {
					1: { status: 200, body: { openIssues: 2 } },
					2: { error: new Error('nope') },
				};
			},
		};

		let results = await fetchMilestoneOverviewsBulk(bulk, [{ id: '1' }, { id: '2' }, {}]);

		assert.strictEqual(calls.length, 1, 'one bulk call');
		assert.deepEqual(
			calls[0].map((item) => item.id),
			['1', '2'],
			'entries without id skipped'
		);
		assert.ok(calls[0][0].url.endsWith('/milestoneoverview/1?includeHours=true'), 'overview URL');
		assert.deepEqual(results, [
			{ id: '1', overview: { openIssues: 2 } },
			{ id: '2', overview: null },
		]);
	});

	test('it makes no call without milestones', async function (assert) {
		let bulk = {
			query() {
				assert.ok(false, 'not called');
			},
		};

		assert.deepEqual(await fetchMilestoneOverviewsBulk(bulk, []), []);
	});
});

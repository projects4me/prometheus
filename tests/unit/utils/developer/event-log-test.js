import { module, test } from 'qunit';
import EventLog from 'prometheus/utils/developer/event-log';

module('Unit | Utility | developer/event-log', function () {
	test('log adds newest first', function (assert) {
		const log = new EventLog();
		log.log('a', 1);
		log.log('b');
		assert.deepEqual(
			log.entries.map((e) => e.name),
			['b', 'a']
		);
		assert.deepEqual(log.entries[1].args, [1]);
	});

	test('wrap logs then calls fn', function (assert) {
		const log = new EventLog();
		const fn = (x) => x * 2;
		assert.strictEqual(log.wrap('double', fn)(4), 8);
		assert.strictEqual(log.entries[0].name, 'double');
		assert.deepEqual(log.entries[0].args, [4]);
	});

	test('caps at 50 and clears', function (assert) {
		const log = new EventLog();
		for (let i = 0; i < 60; i++) {
			log.log('e' + i);
		}
		assert.strictEqual(log.entries.length, 50);
		assert.strictEqual(log.entries[0].name, 'e59');
		log.clear();
		assert.strictEqual(log.entries.length, 0);
	});
});

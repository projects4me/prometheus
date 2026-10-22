import { module, test } from 'qunit';
import groupByIssue from 'prometheus/utils/notifications/group-by-issue';

const n = (id, date, context) => ({ id, dateCreated: date, context });
const issue = (id, date, code = 'ABC', num = '1', relatedTo = 'issue') =>
	n(id, date, { relatedTo, projectShortcode: code, issueNumber: num });

module('Unit | Utility | notifications/group-by-issue', function () {
	test('groups issue, comment and timelog notifications of one issue', function (assert) {
		let result = groupByIssue([
			issue('1', '2026-01-01T10:00:00Z'),
			issue('2', '2026-01-01T11:00:00Z', 'ABC', '1', 'comment'),
			issue('3', '2026-01-01T12:00:00Z', 'ABC', '1', 'timelog'),
			issue('4', '2026-01-01T09:00:00Z', 'ABC', '2')
		]);
		assert.strictEqual(result.length, 2);
		assert.deepEqual(
			result[0].notifications.map((x) => x.id),
			['3', '2', '1']
		);
		assert.strictEqual(result[0].shortcode, 'ABC');
	});

	test('shortcode is case-insensitive', function (assert) {
		let result = groupByIssue([
			issue('1', '2026-01-01T10:00:00Z', 'abc'),
			issue('2', '2026-01-01T11:00:00Z', 'ABC')
		]);
		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0].notifications.length, 2);
	});

	test('non-issue notifications and missing context stay standalone, in time order', function (assert) {
		let result = groupByIssue([
			n('p', '2026-01-01T08:00:00Z', {
				relatedTo: 'project',
				projectShortcode: 'ABC'
			}),
			issue('1', '2026-01-01T10:00:00Z'),
			n('m', '2026-01-01T12:00:00Z', {
				relatedTo: 'milestone',
				projectShortcode: 'ABC'
			}),
			n('x', '2026-01-01T11:00:00Z', undefined),
			issue('2', '2026-01-01T07:00:00Z', 'ABC', null),
			issue('3', '2026-01-01T09:00:00Z')
		]);
		assert.deepEqual(
			result.map((e) => (e.isGroup ? 'group' : e.notification.id)),
			['m', 'x', 'group', 'p', '2']
		);
	});

	test('entries are ordered by their newest notification', function (assert) {
		let result = groupByIssue([
			issue('a', '2026-01-01T10:00:00Z', 'ABC', '1'),
			issue('b', '2026-01-01T11:00:00Z', 'ABC', '2'),
			issue('c', '2026-01-01T12:00:00Z', 'ABC', '1')
		]);
		assert.deepEqual(
			result.map((e) => e.issueNumber),
			['1', '2']
		);
	});

	test('empty input', function (assert) {
		assert.deepEqual(groupByIssue([]), []);
		assert.deepEqual(groupByIssue(), []);
	});
});

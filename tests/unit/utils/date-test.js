import { module, test } from 'qunit';
import DateUtils, * as dates from 'prometheus/utils/date';

// These tests are the contract for the date module: they pass the zone explicitly so they do not depend
// on the machine's timezone, and they must keep passing when the implementation behind it changes.
const UTC = { zone: 'UTC' };
const NEW_YORK = { zone: 'America/New_York' };
const STAMP = 'YYYY-MM-DD HH:mm:ss';

module('Unit | Utility | date', function () {
	module('parse and format', function () {
		test('Gaia timestamps are read as UTC', function (assert) {
			assert.strictEqual(dates.parseGaia('2024-03-10 23:30:00').toISOString(), '2024-03-10T23:30:00.000Z');
			assert.strictEqual(dates.toISOString('2024-03-10 23:30:00', UTC), '2024-03-10T23:30:00.000Z');
		});

		test('a Gaia timestamp is shown in a zone ahead of UTC', function (assert) {
			assert.strictEqual(dates.toUserTimezone('2024-03-10 23:30:00', 'Asia/Karachi'), '2024-03-11 04:30:00');
		});

		test('a Gaia timestamp is shown in a zone behind UTC', function (assert) {
			assert.strictEqual(dates.toUserTimezone('2024-01-15 02:00:00', 'America/New_York'), '2024-01-14 21:00:00');
			assert.strictEqual(
				dates.toUserTimezone('2024-01-15 02:00:00', 'America/New_York', 'MMM DD, YYYY'),
				'Jan 14, 2024'
			);
		});

		test('date-only values do not shift a day', function (assert) {
			for (const zone of ['UTC', 'Pacific/Auckland', 'America/Los_Angeles', 'Asia/Karachi']) {
				assert.strictEqual(dates.format('2024-03-15', 'YYYY-MM-DD', { zone }), '2024-03-15', zone);
			}
			assert.strictEqual(dates.format(dates.parse('2024-03-15'), 'YYYY-MM-DD'), '2024-03-15', 'local');
			assert.strictEqual(dates.part('2024-03-15', 'date'), 15);
		});

		test('format supports the tokens in use', function (assert) {
			const input = '2024-03-05 14:07:09';
			assert.strictEqual(dates.format(input, 'YYYY-MM-DD', UTC), '2024-03-05');
			assert.strictEqual(dates.format(input, STAMP, UTC), '2024-03-05 14:07:09');
			assert.strictEqual(dates.format(input, 'YYYY-MM-DD HH:mm:ss.0', UTC), '2024-03-05 14:07:09.0');
			assert.strictEqual(dates.format(input, 'MMM DD, YYYY', UTC), 'Mar 05, 2024');
			assert.strictEqual(dates.format(input, 'DD MMMM YYYY', UTC), '05 March 2024');
			assert.strictEqual(dates.format(input, 'Do MMM. YYYY', UTC), '5th Mar. 2024');
			assert.strictEqual(dates.format(input, 'DD MMM', UTC), '05 Mar');
			assert.strictEqual(dates.format(input, 'DD-MM', UTC), '05-03');
			assert.strictEqual(dates.format(input, 'ddd', UTC), 'Tue');
			assert.strictEqual(dates.format(input, 'MMM', UTC), 'Mar');
			assert.strictEqual(dates.format(input, 'YYYY', UTC), '2024');
			assert.strictEqual(dates.format(input, 'DD', UTC), '05');
			assert.strictEqual(dates.format(input, 'HH:mm', UTC), '14:07');
			assert.strictEqual(dates.format(input, 'Z', UTC), '+00:00');
			assert.strictEqual(dates.format(input, 'Z', NEW_YORK), '-05:00');
		});

		test('invalid input', function (assert) {
			assert.false(dates.isValid('not a date', UTC));
			assert.false(dates.isValid('2024-02-30', UTC));
			assert.false(dates.isValid('', UTC));
			assert.true(dates.isValid('2024-02-29', UTC));
			assert.true(Number.isNaN(dates.parse('not a date').getTime()));
			assert.strictEqual(dates.format('not a date', 'YYYY-MM-DD', UTC), 'Invalid date');
		});
	});

	module('arithmetic', function () {
		test('add and subtract', function (assert) {
			assert.strictEqual(dates.format(dates.add('2024-03-05', 10, 'days', UTC), 'YYYY-MM-DD', UTC), '2024-03-15');
			assert.strictEqual(dates.format(dates.add('2024-03-05', 2, 'weeks', UTC), 'YYYY-MM-DD', UTC), '2024-03-19');
			assert.strictEqual(
				dates.format(dates.subtract('2024-03-05', 10, 'days', UTC), 'YYYY-MM-DD', UTC),
				'2024-02-24'
			);
			assert.strictEqual(
				dates.format(dates.add('2024-03-05 10:00:00', 90, 'minutes', UTC), STAMP, UTC),
				'2024-03-05 11:30:00'
			);
		});

		test('month-end arithmetic clamps to the last day of the month', function (assert) {
			assert.strictEqual(dates.format(dates.add('2024-01-31', 1, 'month', UTC), 'YYYY-MM-DD', UTC), '2024-02-29');
			assert.strictEqual(dates.format(dates.add('2023-01-31', 1, 'month', UTC), 'YYYY-MM-DD', UTC), '2023-02-28');
			assert.strictEqual(dates.format(dates.add('2024-03-31', -1, 'month', UTC), 'YYYY-MM-DD', UTC), '2024-02-29');
			assert.strictEqual(
				dates.format(dates.subtract('2024-03-31', 1, 'month', UTC), 'YYYY-MM-DD', UTC),
				'2024-02-29'
			);
		});

		test('a day is a calendar day across a DST boundary', function (assert) {
			// US clocks go forward on 2024-03-10, so that day has 23 hours.
			const before = '2024-03-09 12:00:00';
			const after = dates.add(before, 1, 'days', NEW_YORK);
			assert.strictEqual(dates.format(after, 'YYYY-MM-DD HH:mm', NEW_YORK), '2024-03-10 12:00');
			assert.strictEqual(dates.diff(after, before, 'hours', NEW_YORK), 23);
			assert.strictEqual(dates.diff(after, before, 'days', NEW_YORK), 1, 'whole calendar day');
			// ... and clocks go back on 2024-11-03, so that day has 25 hours.
			const fallBefore = '2024-11-02 12:00:00';
			const fallAfter = dates.add(fallBefore, 1, 'days', NEW_YORK);
			assert.strictEqual(dates.format(fallAfter, 'YYYY-MM-DD HH:mm', NEW_YORK), '2024-11-03 12:00');
			assert.strictEqual(dates.diff(fallAfter, fallBefore, 'hours', NEW_YORK), 25);
		});

		test('diff', function (assert) {
			assert.strictEqual(dates.diff('2024-03-15', '2024-03-05', 'days', UTC), 10);
			assert.strictEqual(dates.diff('2024-03-05', '2024-03-15', 'days', UTC), -10);
			assert.strictEqual(dates.diff('2024-03-05 10:00:00', '2024-03-05 08:30:00', 'hours', UTC), 1, 'truncates');
			assert.strictEqual(dates.diff('2024-03-05 10:00:00', '2024-03-05 08:30:00', undefined, UTC), 5400000);
		});
	});

	module('boundaries', function () {
		const wednesday = '2024-03-13 15:45:10';

		test('startOf and endOf', function (assert) {
			const at = (fn, unit) => dates.format(fn(wednesday, unit, UTC), STAMP, UTC);
			assert.strictEqual(at(dates.startOf, 'day'), '2024-03-13 00:00:00');
			assert.strictEqual(at(dates.endOf, 'day'), '2024-03-13 23:59:59');
			assert.strictEqual(at(dates.startOf, 'month'), '2024-03-01 00:00:00');
			assert.strictEqual(at(dates.endOf, 'month'), '2024-03-31 23:59:59');
			assert.strictEqual(at(dates.startOf, 'year'), '2024-01-01 00:00:00');
			assert.strictEqual(at(dates.endOf, 'year'), '2024-12-31 23:59:59');
		});

		test('the week starts on Sunday and the ISO week on Monday', function (assert) {
			const at = (fn, unit) => dates.format(fn(wednesday, unit, UTC), STAMP, UTC);
			assert.strictEqual(at(dates.startOf, 'week'), '2024-03-10 00:00:00');
			assert.strictEqual(at(dates.endOf, 'week'), '2024-03-16 23:59:59');
			assert.strictEqual(at(dates.startOf, 'isoWeek'), '2024-03-11 00:00:00');
			assert.strictEqual(at(dates.endOf, 'isoWeek'), '2024-03-17 23:59:59');
			assert.strictEqual(dates.part(wednesday, 'isoWeek', UTC), 11);
			assert.strictEqual(dates.part('2021-01-03', 'isoWeekYear', UTC), 2020, 'ISO year differs from the calendar year');
		});

		test('startOf day follows the zone', function (assert) {
			const utc = new Date('2024-03-13T03:00:00Z'); // still the 12th in New York
			assert.strictEqual(dates.format(dates.startOf(utc, 'day', NEW_YORK), STAMP, NEW_YORK), '2024-03-12 00:00:00');
			assert.strictEqual(dates.format(dates.startOf(utc, 'day', UTC), STAMP, UTC), '2024-03-13 00:00:00');
		});

		test('part', function (assert) {
			assert.strictEqual(dates.part(wednesday, 'year', UTC), 2024);
			assert.strictEqual(dates.part(wednesday, 'month', UTC), 2);
			assert.strictEqual(dates.part(wednesday, 'date', UTC), 13);
			assert.strictEqual(dates.part(wednesday, 'day', UTC), 3);
		});
	});

	module('comparison', function () {
		test('isBefore, isAfter and isSame', function (assert) {
			assert.true(dates.isBefore('2024-03-05', '2024-03-06', UTC));
			assert.false(dates.isBefore('2024-03-06', '2024-03-06', UTC));
			assert.true(dates.isAfter('2024-03-07', '2024-03-06', UTC));
			assert.false(dates.isAfter('2024-03-06', '2024-03-06', UTC));
			assert.true(dates.isSame('2024-03-06', '2024-03-06', UTC));
			assert.true(dates.isSameOrBefore('2024-03-06', '2024-03-06', UTC));
			assert.true(dates.isSameOrAfter('2024-03-06', '2024-03-06', UTC));
			assert.false(dates.isSameOrAfter('2024-03-05', '2024-03-06', UTC));
		});

		test('comparison by unit', function (assert) {
			const morning = '2024-03-06 08:00:00';
			const evening = '2024-03-06 20:00:00';
			assert.true(dates.isBefore(morning, evening, UTC));
			assert.false(dates.isBefore(morning, evening, { ...UTC, unit: 'day' }));
			assert.true(dates.isSame(morning, evening, { ...UTC, unit: 'day' }));
			assert.true(dates.isSameOrAfter(morning, '2024-03-06', { ...UTC, unit: 'day' }));
			assert.false(dates.isSame('2024-03-06', '2024-04-06', { ...UTC, unit: 'month' }));
		});

		test('works with Date objects', function (assert) {
			const a = new Date('2024-03-05T00:00:00Z');
			const b = new Date('2024-03-06T00:00:00Z');
			assert.true(dates.isBefore(a, b));
			assert.strictEqual(dates.diff(b, a, 'days'), 1);
		});
	});

	module('relative time and durations', function () {
		test('fromNow', function (assert) {
			assert.strictEqual(dates.fromNow(dates.subtract(dates.now(), 3, 'hours')), '3 hours ago');
			assert.strictEqual(dates.fromNow(dates.add(dates.now(), 2, 'days')), 'in 2 days');
		});

		test('humanizeDuration', function (assert) {
			assert.strictEqual(dates.humanizeDuration(2, 'days'), '2 days');
			assert.strictEqual(dates.humanizeDuration(90, 'minutes'), '2 hours');
			assert.strictEqual(dates.humanizeDuration(3 * 3600 * 1000), '3 hours');
		});

		test('durationParts', function (assert) {
			assert.deepEqual(dates.durationParts(135), { hours: 2, minutes: 15 });
			assert.deepEqual(dates.durationParts(1000), { hours: 16, minutes: 40 });
			assert.deepEqual(dates.durationParts(0), { hours: 0, minutes: 0 });
		});
	});

	module('timezones', function () {
		test('guessTimezone returns a known zone name', function (assert) {
			const zone = dates.guessTimezone();
			assert.strictEqual(typeof zone, 'string');
			assert.true(dates.timezoneList().some((info) => info.name === zone) || zone === 'UTC', zone);
		});

		test('timezoneInfo gives the offset and abbreviation', function (assert) {
			const karachi = dates.timezoneInfo('Asia/Karachi');
			assert.strictEqual(karachi.name, 'Asia/Karachi');
			assert.strictEqual(karachi.offset, 300);
			assert.strictEqual(karachi.offsetText, '+05:00');
			assert.strictEqual(typeof karachi.abbr, 'string');

			const utc = dates.timezoneInfo('UTC');
			assert.strictEqual(utc.offset, 0);
			assert.strictEqual(utc.offsetText, '+00:00');
		});

		test('timezoneList covers the IANA zones', function (assert) {
			const list = dates.timezoneList();
			assert.true(list.length > 300);
			assert.true(['Asia/Karachi', 'America/New_York', 'Europe/London', 'UTC'].every((name) => list.some((info) => info.name === name)));
			assert.true(list.every((info) => typeof info.offset === 'number' && /^[+-]\d\d:\d\d$/.test(info.offsetText)));
		});
	});

	module('DateUtils', function () {
		test('getHoursAndMinutes', function (assert) {
			assert.deepEqual(DateUtils.getHoursAndMinutes(2.75), { hours: 2, minutes: 45 });
			assert.deepEqual(DateUtils.getHoursAndMinutes(NaN), { hours: 0, minutes: 0 });
		});

		test('normalizeMinutes', function (assert) {
			assert.deepEqual(DateUtils.normalizeMinutes(135), { hours: 2, minutes: 15 });
		});

		test('getNow is a UTC timestamp', function (assert) {
			assert.true(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(DateUtils.getNow()));
			assert.true(Math.abs(dates.diff(dates.parseGaia(DateUtils.getNow()), dates.now(), 'seconds')) <= 2);
		});

		test('getWeekRangeForPage spans an ISO week and pages go back a week', function (assert) {
			const current = DateUtils.getWeekRangeForPage(1);
			const previous = DateUtils.getWeekRangeForPage(2);
			assert.true(/ 00:00:00\.0$/.test(current.startOfWeek));
			assert.true(/ 23:59:59\.0$/.test(current.endOfWeek));
			assert.strictEqual(dates.part(current.startOfWeek, 'day'), 1, 'starts on Monday');
			assert.strictEqual(dates.diff(current.startOfWeek, previous.startOfWeek, 'days'), 7);
		});

		test('getRangeByContext', function (assert) {
			const today = DateUtils.getRangeByContext('today');
			assert.true(/ 00:00:00\.0$/.test(today.startDate));
			assert.true(/ 23:59:59\.0$/.test(today.endDate));
			assert.deepEqual(DateUtils.getRangeByContext('unknown'), today, 'falls back to today');
			const month = DateUtils.getRangeByContext('thisMonth');
			assert.true(/-01 00:00:00\.0$/.test(month.startDate));
			const last = DateUtils.getRangeByContext('lastMonth');
			assert.strictEqual(dates.diff(month.startDate, last.endDate, 'seconds'), 1);
			const year = DateUtils.getRangeByContext('thisYear');
			assert.true(/-01-01 00:00:00\.0$/.test(year.startDate));
			assert.true(/-12-31 23:59:59\.0$/.test(year.endDate));
		});
	});
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { TimeAxis } from 'prometheus/utils/gantt/time-axis';

// 2026-03-01 is a Sunday, 2026-03-02 a Monday, 2026-03-07/08 a weekend
const at = (day, hour, minute = 0) => new Date(2026, 2, day, hour, minute);

module('Unit | Utility | gantt/time-axis', function () {
  test('the calendar axis has a column per day; the Hours axis only the working days', function (assert) {
    let days = new TimeAxis('2026-03-01', '2026-03-10', 'days');
    assert.strictEqual(days.columns.length, 10);
    let hours = new TimeAxis('2026-03-01', '2026-03-10', 'hours');
    assert.deepEqual(hours.columns, [
      '2026-03-02',
      '2026-03-03',
      '2026-03-04',
      '2026-03-05',
      '2026-03-06',
      '2026-03-09',
      '2026-03-10',
    ], 'a Sunday start moves to Monday; the weekend is skipped');
  });

  test('09:00 is a column\'s left edge and 18:00 its right edge, in every scale', function (assert) {
    let days = new TimeAxis('2026-03-01', '2026-03-31', 'days');
    assert.strictEqual(days.momentOffset(at(2, 9)), 1);
    assert.ok(Math.abs(days.momentOffset(at(2, 12)) - (1 + 3 / 9)) < 1e-9, 'noon is a third in');
    assert.strictEqual(days.momentOffset(at(2, 18)), 2);
    assert.strictEqual(days.momentOffset(at(2, 7)), 1, 'before 09:00 clamps to the left edge');
    assert.strictEqual(days.momentOffset(at(2, 22)), 2, 'after 18:00 clamps to the right edge');

    let hours = new TimeAxis('2026-03-01', '2026-03-31', 'hours');
    assert.strictEqual(hours.momentOffset(at(6, 9)), 4, 'Friday');
    assert.ok(Math.abs(hours.momentOffset(at(9, 12)) - (5 + 3 / 9)) < 1e-9, 'Monday after the weekend is the next column');
    assert.strictEqual(hours.momentOffset(at(7, 12)), 5, 'a weekend moment sits at the next working day');
    assert.strictEqual(hours.momentOffset(null), null);
  });

  test('a chain on one day gives stepped spans', function (assert) {
    let axis = new TimeAxis('2026-03-01', '2026-03-31', 'hours');
    let first = axis.momentSpan(at(3, 9), at(3, 12));
    let second = axis.momentSpan(at(3, 12), at(3, 16, 30));
    let close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual}`);
    close(first.start, 1, 'the first starts at Tuesday 09:00');
    close(first.days, 3 / 9, 'three hours wide');
    close(second.start, first.start + first.days, 'the second starts where the first ends');
    close(second.days, 4.5 / 9, 'four and a half hours wide');
  });

  test('a date span covers whole days: calendar days, or the working window in Hours', function (assert) {
    let days = new TimeAxis('2026-03-01', '2026-03-31', 'days');
    assert.deepEqual(days.dateSpan('2026-03-05', '2026-03-09'), { start: 4, days: 5 });
    let hours = new TimeAxis('2026-03-01', '2026-03-31', 'hours');
    assert.deepEqual(hours.dateSpan('2026-03-05', '2026-03-09'), { start: 3, days: 3 }, 'Thu, Fri and Mon');
    assert.strictEqual(days.dateSpan(null, '2026-03-09'), null);
  });

  test('dates move by whole columns: calendar days, or working days in Hours', function (assert) {
    let days = new TimeAxis('2026-03-01', '2026-03-31', 'days');
    assert.strictEqual(days.shiftDate('2026-03-06', 1), '2026-03-07');
    assert.strictEqual(days.shiftDate('2026-03-06', -6), '2026-02-28');
    let hours = new TimeAxis('2026-03-01', '2026-03-31', 'hours');
    assert.strictEqual(hours.shiftDate('2026-03-06', 1), '2026-03-09', 'Friday + 1 is Monday');
    assert.strictEqual(hours.shiftDate('2026-03-09', -1), '2026-03-06', 'Monday - 1 is Friday');
    assert.strictEqual(hours.shiftDate('2026-03-07', 1), '2026-03-10', 'a Saturday moves from Monday');
    assert.strictEqual(hours.shiftDate('2026-03-07', 0), '2026-03-07', 'no move keeps the date');
    assert.strictEqual(hours.dateAt(5.5), '2026-03-09');
  });

  test('day offsets reach before and past the timeline', function (assert) {
    let hours = new TimeAxis('2026-03-02', '2026-03-06', 'hours');
    assert.strictEqual(hours.dayOffset('2026-02-27'), -1, 'the Friday before');
    assert.strictEqual(hours.dayOffset('2026-02-28'), 0, 'a weekend before is the next working day');
    assert.strictEqual(hours.dayOffset('2026-03-16'), 10, 'two weeks on');
  });
});

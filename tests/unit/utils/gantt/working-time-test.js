/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import {
  WORK_HOURS_PER_DAY,
  addWorkingHours,
  nextWorkingMoment,
  previousWorkingMoment,
  workDayEnd,
  workDayStart,
  workingHoursBetween,
} from 'prometheus/utils/gantt/working-time';

// 2026-03-02 is a Monday, 2026-03-06 a Friday
const at = (day, hour, minute = 0) => new Date(2026, 2, day, hour, minute);

module('Unit | Utility | gantt/working-time', function () {
  test('a working day runs 09:00 to 18:00', function (assert) {
    assert.strictEqual(WORK_HOURS_PER_DAY, 9);
    assert.deepEqual(workDayStart('2026-03-02'), at(2, 9));
    assert.deepEqual(workDayEnd('2026-03-02T00:00:00'), at(2, 18));
    assert.strictEqual(workDayStart(null), null);
    assert.strictEqual(workDayEnd('not a date'), null);
  });

  test('a moment outside working time moves to the next or the previous working moment', function (assert) {
    assert.deepEqual(nextWorkingMoment(at(2, 7)), at(2, 9), 'early morning');
    assert.deepEqual(
      nextWorkingMoment(at(2, 11, 30)),
      at(2, 11, 30),
      'inside the day',
    );
    assert.deepEqual(
      nextWorkingMoment(at(2, 18)),
      at(3, 9),
      'at the end of the day',
    );
    assert.deepEqual(nextWorkingMoment(at(7, 10)), at(9, 9), 'Saturday');
    assert.deepEqual(previousWorkingMoment(at(8, 10)), at(6, 18), 'Sunday');
    assert.deepEqual(previousWorkingMoment(at(3, 20)), at(3, 18), 'evening');
    assert.deepEqual(
      previousWorkingMoment(at(3, 18)),
      at(3, 18),
      'the end of the day itself',
    );
  });

  test('adding working hours within a day', function (assert) {
    assert.deepEqual(
      addWorkingHours(at(2, 9), 9),
      at(2, 18),
      'a full day ends at 18:00',
    );
    assert.deepEqual(addWorkingHours(at(2, 9), 0.9), at(2, 9, 54));
  });

  test('adding working hours skips the night', function (assert) {
    assert.deepEqual(addWorkingHours(at(2, 17), 2), at(3, 10));
    assert.deepEqual(
      addWorkingHours(at(2, 20), 1),
      at(3, 10),
      'a start after hours starts the next morning',
    );
  });

  test('adding working hours spills from Friday to Monday', function (assert) {
    assert.deepEqual(addWorkingHours(at(6, 16), 4), at(9, 11));
    assert.deepEqual(
      addWorkingHours(at(7, 12), 3),
      at(9, 12),
      'a weekend start starts on Monday',
    );
  });

  test('working hours between two moments', function (assert) {
    assert.strictEqual(workingHoursBetween(at(2, 9), at(2, 18)), 9);
    assert.strictEqual(
      workingHoursBetween(at(2, 17), at(3, 10)),
      2,
      'the night does not count',
    );
    assert.strictEqual(
      workingHoursBetween(at(6, 16), at(9, 11)),
      4,
      'the weekend does not count',
    );
    assert.strictEqual(
      workingHoursBetween(at(2, 9), at(6, 18)),
      45,
      'a working week',
    );
    assert.strictEqual(
      workingHoursBetween(at(3, 9), at(2, 9)),
      0,
      'backwards is zero',
    );
  });
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { schedule, MIN_DURATION_HOURS } from 'prometheus/utils/gantt/schedule';

// 2026-03-02 is a Monday
const at = (day, hour, minute = 0) => new Date(2026, 2, day, hour, minute);
const MONDAY = '2026-03-02';
const issue = (
  id,
  estimateHours = null,
  startDate = MONDAY,
  endDate = startDate,
) => ({
  id,
  startDate,
  endDate,
  estimateHours,
});
const chain = (...ids) =>
  ids.slice(1).map((id, index) => ({ sourceId: ids[index], targetId: id }));

module('Unit | Utility | gantt/schedule', function () {
  test('an estimated chain on one day runs back to back', function (assert) {
    let result = schedule(
      [issue('a', 3), issue('b', 2), issue('c', 4)],
      chain('a', 'b', 'c'),
    );
    assert.deepEqual(result.get('a'), {
      plannedStart: at(2, 9),
      plannedEnd: at(2, 12),
      durationHours: 3,
      pushed: false,
    });
    assert.deepEqual(result.get('b'), {
      plannedStart: at(2, 12),
      plannedEnd: at(2, 14),
      durationHours: 2,
      pushed: false,
    });
    assert.deepEqual(result.get('c'), {
      plannedStart: at(2, 14),
      plannedEnd: at(2, 18),
      durationHours: 4,
      pushed: false,
    });
  });

  test('two unestimated issues share their window in halves', function (assert) {
    let result = schedule([issue('a'), issue('b')], chain('a', 'b'));
    assert.strictEqual(result.get('a').durationHours, 4.5);
    assert.deepEqual(result.get('a').plannedEnd, at(2, 13, 30));
    assert.deepEqual(result.get('b').plannedStart, at(2, 13, 30));
    assert.deepEqual(result.get('b').plannedEnd, at(2, 18));
    assert.false(result.get('b').pushed);
  });

  test('ten unestimated issues share their window in tenths', function (assert) {
    let ids = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    let result = schedule(
      ids.map((id) => issue(id)),
      chain(...ids),
    );
    ids.forEach((id) =>
      assert.strictEqual(
        result.get(id).durationHours,
        0.9,
        `issue ${id} gets a tenth`,
      ),
    );
    assert.deepEqual(result.get('1').plannedEnd, at(2, 9, 54));
    assert.deepEqual(
      result.get('10').plannedEnd,
      at(2, 18),
      'the last one ends at the end of the day',
    );
    assert.false(result.get('10').pushed);
  });

  test('unestimated issues share what the estimated ones in their chain leave', function (assert) {
    let result = schedule(
      [issue('a', 3), issue('b'), issue('c')],
      chain('a', 'b', 'c'),
    );
    assert.strictEqual(result.get('b').durationHours, 3);
    assert.deepEqual(result.get('b').plannedStart, at(2, 12));
    assert.deepEqual(result.get('c').plannedStart, at(2, 15));
    assert.deepEqual(result.get('c').plannedEnd, at(2, 18));
  });

  test('an issue on two chains takes its share of the longer one', function (assert) {
    // a → b → c and a → d, all on one day: a gets a third, d half of the day
    let result = schedule(
      [issue('a'), issue('b'), issue('c'), issue('d')],
      [...chain('a', 'b', 'c'), ...chain('a', 'd')],
    );
    assert.strictEqual(result.get('a').durationHours, 3);
    assert.strictEqual(result.get('d').durationHours, 4.5);
    assert.deepEqual(result.get('d').plannedStart, at(2, 12));
    assert.deepEqual(result.get('d').plannedEnd, at(2, 16, 30));
  });

  test('independent issues keep their whole window', function (assert) {
    let result = schedule(
      [
        issue('a', null, MONDAY, '2026-03-03'),
        issue('b', null, MONDAY, '2026-03-03'),
      ],
      [],
    );
    ['a', 'b'].forEach((id) => {
      assert.deepEqual(result.get(id), {
        plannedStart: at(2, 9),
        plannedEnd: at(3, 18),
        durationHours: 18,
        pushed: false,
      });
    });
  });

  test('blockers in another window do not share the window', function (assert) {
    let result = schedule(
      [issue('a', null, MONDAY), issue('b', null, '2026-03-03')],
      chain('a', 'b'),
    );
    assert.strictEqual(result.get('a').durationHours, 9);
    assert.strictEqual(result.get('b').durationHours, 9);
    assert.deepEqual(result.get('b').plannedStart, at(3, 9));
  });

  test('a blocker in an earlier window pushes a later issue', function (assert) {
    let result = schedule(
      [issue('a', 12, MONDAY), issue('b', null, '2026-03-03')],
      chain('a', 'b'),
    );
    assert.deepEqual(result.get('a').plannedEnd, at(3, 12));
    assert.true(result.get('a').pushed, 'the blocker overruns its own day');
    assert.deepEqual(result.get('b').plannedStart, at(3, 12));
    assert.deepEqual(result.get('b').plannedEnd, at(4, 12));
    assert.true(
      result.get('b').pushed,
      'the blocked issue ends after its window',
    );
  });

  test('a chain that fits is not pushed, one that does not is', function (assert) {
    let fits = schedule([issue('a', 4), issue('b', 5)], chain('a', 'b'));
    assert.false(fits.get('b').pushed);
    let overruns = schedule([issue('a', 5), issue('b', 5)], chain('a', 'b'));
    assert.true(overruns.get('b').pushed);
    assert.deepEqual(overruns.get('b').plannedEnd, at(3, 10));
  });

  test('unestimated issues never drop below the minimum', function (assert) {
    let result = schedule([issue('a', 9), issue('b')], chain('a', 'b'));
    assert.strictEqual(result.get('b').durationHours, MIN_DURATION_HOURS);
    assert.deepEqual(
      result.get('b').plannedStart,
      at(3, 9),
      'it starts the next morning',
    );
    assert.true(result.get('b').pushed);
  });

  test('a weekend window moves inside working time', function (assert) {
    let result = schedule([issue('a', null, '2026-03-07', '2026-03-09')], []);
    assert.deepEqual(result.get('a').plannedStart, at(9, 9));
    assert.strictEqual(result.get('a').durationHours, 9);
  });

  test('issues without dates and links to them are skipped', function (assert) {
    let result = schedule(
      [
        issue('a', 3),
        { id: 'b', startDate: null, endDate: MONDAY, estimateHours: 2 },
        issue('c'),
      ],
      [
        ...chain('a', 'b'),
        ...chain('b', 'c'),
        { sourceId: 'x', targetId: 'c' },
      ],
    );
    assert.false(result.has('b'));
    assert.deepEqual(result.get('c').plannedStart, at(2, 9));
    assert.strictEqual(result.get('c').durationHours, 9);
  });

  test('a cycle is broken instead of hanging', function (assert) {
    let result = schedule(
      [issue('a', 2), issue('b', 3), issue('c', 1)],
      [...chain('a', 'b', 'c'), { sourceId: 'c', targetId: 'a' }],
    );
    assert.strictEqual(result.size, 3);
    assert.deepEqual(
      result.get('a').plannedStart,
      at(2, 9),
      'the links into the first issue are dropped',
    );
    assert.deepEqual(result.get('b').plannedStart, at(2, 11));
    assert.deepEqual(result.get('c').plannedEnd, at(2, 15));
  });
});

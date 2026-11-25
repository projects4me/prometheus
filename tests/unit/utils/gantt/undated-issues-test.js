/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { getOrderedIssues, countUndatedIssues, getMilestoneBarDates } from 'prometheus/utils/gantt-helpers';

module('Unit | Utility | gantt-helpers | undated issues', function () {
    const dated = { id: 'a', startDate: '2026-11-10', endDate: '2026-11-12' };
    const undated = { id: 'b', startDate: null, endDate: null };
    const milestone = { startDate: '2026-11-01', endDate: '2026-11-30', issues: [undated, dated] };

    test('getOrderedIssues lists dated issues first', function (assert) {
        assert.deepEqual(getOrderedIssues(milestone).map((i) => i.id), ['a', 'b']);
    });

    test('countUndatedIssues counts issues without dates across milestones', function (assert) {
        assert.strictEqual(countUndatedIssues([milestone, milestone]), 2);
        assert.strictEqual(countUndatedIssues(undefined), 0);
    });

    test('undated issues do not widen the milestone bar', function (assert) {
        assert.deepEqual(getMilestoneBarDates(milestone), { start: '2026-11-01', end: '2026-11-30' });
    });
});

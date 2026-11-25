/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { getMilestoneState } from 'prometheus/utils/gantt-helpers';

module('Unit | Utility | gantt-helpers | getMilestoneState', function () {
    const TODAY = '2026-11-25';

    function milestone(endDate, statuses) {
        return {
            startDate: '2026-11-01',
            endDate,
            issues: statuses.map((status, i) => ({
                id: String(i + 1),
                status,
                startDate: '2026-11-02',
                endDate: '2026-11-05'
            }))
        };
    }

    test('done when it has issues and all are finished, even past its end', function (assert) {
        assert.strictEqual(getMilestoneState(milestone('2026-11-10', ['done', 'closed', 'deferred']), TODAY), 'done');
    });

    test('overdue when its end is before today and not all issues are finished', function (assert) {
        assert.strictEqual(getMilestoneState(milestone('2026-11-24', ['done', 'in_progress']), TODAY), 'overdue');
    });

    test('overdue when it has no issues and its end has passed', function (assert) {
        assert.strictEqual(getMilestoneState(milestone('2026-11-24', []), TODAY), 'overdue');
    });

    test('no state when it ends today or later', function (assert) {
        assert.strictEqual(getMilestoneState(milestone(TODAY, ['new']), TODAY), null);
        assert.strictEqual(getMilestoneState(milestone('2026-12-01', []), TODAY), null);
    });

    test('no state when it has no dates and unfinished issues', function (assert) {
        assert.strictEqual(getMilestoneState({ startDate: null, endDate: null, issues: [{ status: 'new' }] }, TODAY), null);
    });
});

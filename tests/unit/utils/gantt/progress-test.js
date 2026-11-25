/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import {
    timelogMinutes,
    sumTimelogs,
    getIssueProgress,
    getMilestoneProgress
} from 'prometheus/utils/gantt-progress';

module('Unit | Utility | gantt-progress', function () {
    const issue = (done) => ({ id: '1', issuestatus: { done } });

    test('a time log counts its days as 8 hours, plus its hours and minutes', function (assert) {
        assert.strictEqual(timelogMinutes({ days: '1', hours: '2', minutes: '30' }), (8 + 2) * 60 + 30);
        assert.strictEqual(timelogMinutes({ days: null, hours: '', minutes: undefined }), 0);
    });

    test('time logs are summed per issue into spent and estimated minutes', function (assert) {
        const totals = sumTimelogs([
            { issueId: '1', context: 'spent', hours: '1', minutes: '0' },
            { issueId: '1', context: 'spent', hours: '0', minutes: '30' },
            { issueId: '1', context: 'est', hours: '4' },
            { issueId: '2', context: 'est', days: '1' },
            { issueId: '2', context: 'other', hours: '9' }
        ]);
        assert.deepEqual(totals.get('1'), { spent: 90, estimated: 240 });
        assert.deepEqual(totals.get('2'), { spent: 0, estimated: 480 });
        assert.false(totals.has('3'));
    });

    test('an issue whose status counts as done is 100% whatever its hours', function (assert) {
        assert.strictEqual(getIssueProgress(issue('1'), { spent: 0, estimated: 600 }), 100);
        assert.strictEqual(getIssueProgress(issue('1'), undefined), 100);
    });

    test('otherwise spent ÷ estimated, rounded and capped at 100', function (assert) {
        assert.strictEqual(getIssueProgress(issue('0'), { spent: 90, estimated: 240 }), 38);
        assert.strictEqual(getIssueProgress(issue('0'), { spent: 600, estimated: 240 }), 100);
        assert.strictEqual(getIssueProgress(issue('0'), { spent: 0, estimated: 240 }), 0);
    });

    test('no fill without an estimate', function (assert) {
        assert.strictEqual(getIssueProgress(issue('0'), { spent: 120, estimated: 0 }), null);
        assert.strictEqual(getIssueProgress(issue('0'), undefined), null);
        assert.strictEqual(getIssueProgress({ id: '1' }, undefined), null);
    });

    test('a milestone is its finished issues ÷ all its issues', function (assert) {
        const milestone = (statuses) => ({ issues: statuses.map((status) => ({ status })) });
        assert.strictEqual(getMilestoneProgress(milestone(['done', 'closed', 'in_progress'])), 67);
        assert.strictEqual(getMilestoneProgress(milestone(['new', 'new'])), 0);
        assert.strictEqual(getMilestoneProgress(milestone(['done'])), 100);
        assert.strictEqual(getMilestoneProgress(milestone([])), null);
    });
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { getIssueTree } from 'prometheus/utils/gantt-helpers';

module('Unit | Utility | gantt-helpers | issue tree', function () {
    const issue = (id, parentId = null, dated = true) => ({
        id, parentId, startDate: dated ? '2026-11-10' : null, endDate: dated ? '2026-11-12' : null
    });
    const ids = (rows) => rows.map((r) => r.issue.id);

    test('children follow their parent and are indented', function (assert) {
        const milestone = { issues: [issue('c', 'p'), issue('x'), issue('p'), issue('g', 'c')] };
        const rows = getIssueTree(milestone);
        assert.deepEqual(ids(rows), ['x', 'p', 'c', 'g']);
        assert.deepEqual(rows.map((r) => r.depth), [0, 0, 1, 2]);
        assert.true(rows[1].hasChildren);
    });

    test('children sort like top-level issues: dated first', function (assert) {
        const milestone = { issues: [issue('u', 'p', false), issue('d', 'p'), issue('p')] };
        assert.deepEqual(ids(getIssueTree(milestone)), ['p', 'd', 'u']);
    });

    test('a collapsed parent hides all its descendants', function (assert) {
        const milestone = { issues: [issue('p'), issue('c', 'p'), issue('g', 'c'), issue('o')] };
        const rows = getIssueTree(milestone, new Set(['p']));
        assert.deepEqual(ids(rows), ['p', 'o']);
        assert.true(rows[0].isCollapsed);
    });

    test('a child whose parent is in another milestone stays top-level', function (assert) {
        const milestone = { issues: [issue('c', 'elsewhere'), issue('p')] };
        const rows = getIssueTree(milestone);
        assert.deepEqual(rows.map((r) => r.depth), [0, 0]);
        assert.false(rows[0].hasChildren);
    });

    test('indent stops at three levels', function (assert) {
        const milestone = { issues: [issue('a'), issue('b', 'a'), issue('c', 'b'), issue('d', 'c'), issue('e', 'd')] };
        assert.deepEqual(getIssueTree(milestone).map((r) => r.depth), [0, 1, 2, 3, 3]);
    });

    test('a parentId cycle does not loop and every issue shows once', function (assert) {
        const milestone = { issues: [issue('a', 'b'), issue('b', 'a'), issue('s', 's')] };
        const rows = getIssueTree(milestone);
        assert.deepEqual(ids(rows).sort(), ['a', 'b', 's']);
        assert.ok(getIssueTree(milestone, new Set(['a', 'b'])).length <= 3, 'terminates when collapsed');
    });

    test('rows follow planned start, with undated issues last', function (assert) {
        const numbered = (id, number, start, parentId = null) => ({
            id, issueNumber: number, parentId, startDate: start, endDate: start ? '2026-12-30' : null
        });
        const milestone = { issues: [numbered('u', 1, null), numbered('b', 2, '2026-12-10'), numbered('a', 3, '2026-12-01')] };
        assert.deepEqual(ids(getIssueTree(milestone)), ['a', 'b', 'u']);
        const schedule = new Map([['a', { plannedStart: new Date(2026, 11, 20) }]]);
        assert.deepEqual(ids(getIssueTree(milestone, null, { schedule })), ['b', 'a', 'u'], 'the planned start wins');
    });

    test('a blocked issue renders below its blocker even with an earlier number', function (assert) {
        const numbered = (id, number, parentId = null) => ({
            id, issueNumber: number, parentId, startDate: '2026-12-01', endDate: '2026-12-30'
        });
        const blocksLinks = [{ sourceId: 'later', targetId: 'first' }];
        const milestone = { issues: [numbered('first', 1), numbered('later', 2), numbered('kid', 4, 'p'), numbered('p', 3)] };
        assert.deepEqual(ids(getIssueTree(milestone, null, { blocksLinks })), ['later', 'first', 'p', 'kid']);
        const siblings = { issues: [numbered('p', 1), numbered('c2', 3, 'p'), numbered('c1', 2, 'p')] };
        const nested = [{ sourceId: 'c2', targetId: 'c1' }];
        assert.deepEqual(ids(getIssueTree(siblings, null, { blocksLinks: nested })), ['p', 'c2', 'c1']);
    });
});

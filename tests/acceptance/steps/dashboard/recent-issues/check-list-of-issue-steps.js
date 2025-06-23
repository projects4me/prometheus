import steps from '../../steps';

export const then = function () {
    return [
        {
            "There are $issueCount issues present on dashboard": (assert, ctx) => async function (issueCount) {
                assert.dom('[data-recent-issues-table]').exists('Recent Issues Box rendered');
                assert.dom('[data-recent-issues-table] tbody tr').exists({ count: parseInt(issueCount) }, '10 issues are present inside Recent Issues box');
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
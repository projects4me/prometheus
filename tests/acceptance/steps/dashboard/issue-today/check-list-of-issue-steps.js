import steps from '../../steps';

export const then = function () {
    return [
        {
            "There are $issueCount issues present on dashboard": (assert, ctx) => async function (issueCount) {
                assert.dom('.box.box-primary.issues-today').exists('Issue Today Box rendered');
                assert.dom('.box.box-primary.issues-today tbody tr[role="row"]').exists({ count: parseInt(issueCount) }, '10 issues are present inside Issue Today box');
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
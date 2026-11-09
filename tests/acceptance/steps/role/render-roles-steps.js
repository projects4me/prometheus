import steps from '../steps';

export const then = function () {
    return [
        {
            "there are $count roles present in the template": (assert) => async function (count) {
                let roles = document.querySelectorAll('[data-role-browser] [data-test-quick-list-item]');
                assert.equal(roles.length, parseInt(count, 10));
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
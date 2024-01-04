import steps from '../steps';

export const then = function () {
    return [
        {
            "there are $count roles present in the template": (assert) => async function (count) {
                let roles = document.querySelectorAll('.role-card');

                //+1 added to count because there is 1 card for role creation
                assert.equal(roles.length, parseInt(count, 10) + 1);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
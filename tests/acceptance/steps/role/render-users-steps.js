import steps from '../steps';

export const given = function () {
    return [
        {
            "There are $count userroles for role $roleId": (assert, ctx) => async function (count, roleId) {
                let userroles = server.createList('userrole', parseInt(count, 10));

                userroles.forEach((userrole, index) => {
                    let user = server.schema.users.find(String((index % 10) + 1));
                    userrole.update({
                        roleId: roleId,
                        userId: user.id,
                        user: user
                    });
                });
                assert.ok(true, `${count} userroles given to role ${roleId}`);
            }
        }
    ];
}

export const when = function () {
    return [];
}

export const then = function () {
    return [
        {
            "There should $count userroles exists": (assert) => async function (count) {
                assert.dom('[data-role="user-userroles"] li[data-role-userrole-id]').exists({
                    count: parseInt(count, 10)
                });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}

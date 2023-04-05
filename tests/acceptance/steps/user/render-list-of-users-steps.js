import steps from '../steps';

export const then = function () {
    return [
        {
            "There are $expectedCountOfUsers users present inside list view": (assert) => async function (expectedCountOfUsers) {
                let userRows = document.querySelectorAll('div.users table tbody tr');
                
                //checking projects name are rendered properly.
                userRows.forEach((userRow, i) => {
                    let expectedUserName = userRow.querySelector('[data-user-field="name"]').innerText;
                    let actualUserName = server.schema.users.find(i + 1).name;
                    assert.equal(actualUserName, expectedUserName,  `${actualUserName} | ${expectedUserName}`);
                });

                assert.equal(userRows.length, expectedCountOfUsers, `${expectedCountOfUsers} are present inside list view`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
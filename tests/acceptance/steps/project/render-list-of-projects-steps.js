import steps from '../steps';

export default function (assert) {
    return (
        steps(assert)
            .then('There are $expectedCountOfProjects projects present inside list view', async function (expectedCountOfProjects) {
                let projectRows = document.querySelectorAll('div.projects.project table tbody tr');

                projectRows.forEach((projectRow, i) => {
                    let expectedProjectName = projectRow.querySelector('td.project-name > a').innerText;
                    let actualProjectName = server.schema.projects.find(i + 1).name;
                    assert.equal(actualProjectName, expectedProjectName, `${actualProjectName} | ${expectedProjectName}`);
                });

                assert.equal(projectRows.length, expectedCountOfProjects, `${expectedCountOfProjects} are present inside list view`);
            })
            .given('5 users are created and attached as members to project 1', async function () {
                let project = server.schema.projects.find(1);
                let users = server.createList('user', 5);
                project.update({ members: users });
                assert.ok(true, '5 members attached to project 1');
            })
            .then('4 member avatars are visible in the first project row', async function () {
                let firstRow = document.querySelector('div.projects.project table tbody tr');
                let avatars = firstRow.querySelectorAll('td.project-members .member-avatars .member-avatar');
                assert.equal(avatars.length, 4, '4 member avatars are visible');
            })
            .then('the overflow count shows $expectedOverflowCount in the first project row', async function (expectedOverflowCount) {
                let firstRow = document.querySelector('div.projects.project table tbody tr');
                let overflow = firstRow.querySelector('td.project-members .member-avatars .member-avatars-overflow');
                assert.ok(overflow, 'Overflow badge is present');
                assert.equal(overflow.textContent.trim(), `${expectedOverflowCount}`, `Overflow badge shows ${expectedOverflowCount}`);
            })
    );
}

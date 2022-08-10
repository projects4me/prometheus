import steps from '../steps';

export const then = function () {
    return [
        {
            "There are $expectedCountOfProjects projects present inside list view": (assert) => async function (expectedCountOfProjects) {
                let projectRows = document.querySelectorAll('div.projects.project table tbody tr');
                
                //checking projects name are rendered properly.
                projectRows.forEach((projectRow, i) => {
                    let expectedProjectName = projectRow.querySelector('td.project-name > a').innerText;
                    let actualProjectName = server.schema.projects.find(i + 1).name;
                    assert.equal(actualProjectName, expectedProjectName,  `${actualProjectName} | ${expectedProjectName}`);
                });

                assert.equal(projectRows.length, expectedCountOfProjects, `${expectedCountOfProjects} are present inside list view`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
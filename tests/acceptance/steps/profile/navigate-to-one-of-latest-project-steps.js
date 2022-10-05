import { click } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User clicks on latest project $projectIndex": (assert) => async function (projectIndex) {
                let latestProject = server.schema.userlatestprojects.find(parseInt(projectIndex));
                await click(`[data-project="${latestProject.name}"] [data-latest-project-field="name"] a`);
                assert.ok(true, `User clicks on latest project ${projectIndex}`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
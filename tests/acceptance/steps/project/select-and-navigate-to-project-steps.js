import { click } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User selects project $projectIndex from list": (assert) => async function (projectIndex) {
                let projectRows = document.querySelectorAll('div.projects.project table tbody tr');
                let projectToNavigate = projectRows[projectIndex - 1].querySelector('td.project-name > a');

                await click(projectToNavigate);
                assert.ok(true, `User selects project ${projectIndex} from list`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}

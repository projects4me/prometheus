import { find } from '@ember/test-helpers';
import steps from '../steps';
import { chooseOption, chooseOptionAt, noMatchesSelector, openSelect, searchSelect } from 'prometheus/tests/helpers/select';

const HEADER_PROJECT_SWITCHER = '.project-switcher';

export const given = function () {
    return [
        {
            "tracked project service has id null": (assert) => async function () {
                let trackedProjectService = this.owner.lookup('service:tracked-project');
                trackedProjectService.setProjectId(null);
                assert.ok(true, 'tracked project service has id null');
            }
        }
    ];
}

export const when = function () {
    return [
        {
            "User selects project $projectId from header": (assert) => async function (projectId) {
                await openSelect(HEADER_PROJECT_SWITCHER);
                await chooseOptionAt(`${HEADER_PROJECT_SWITCHER} > div`, projectId - 1);
                assert.ok(true, `User selects project ${projectId} from header`);
            }
        },
        {
            "User searches and selects project \"$label\" from header": (assert) => async function (label) {
                await openSelect(HEADER_PROJECT_SWITCHER);
                await searchSelect(HEADER_PROJECT_SWITCHER, label);
                await chooseOption(HEADER_PROJECT_SWITCHER, label);
                assert.ok(true, `User searches and selects project ${label} from header`);
            }
        },
        {
            "User searches for \"$query\" in header project switcher": (assert) => async function (query) {
                await openSelect(HEADER_PROJECT_SWITCHER);
                await searchSelect(HEADER_PROJECT_SWITCHER, query);
                assert.ok(true, `User searches for ${query} in header project switcher`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "Header project switcher shows no projects found": (assert) => async function () {
                let noMatches = find(noMatchesSelector());
                assert.ok(noMatches, 'no-matches message element is shown');
                assert.equal(
                    noMatches.textContent.trim(),
                    'No project found',
                    'no-matches message text is No project found'
                );
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}

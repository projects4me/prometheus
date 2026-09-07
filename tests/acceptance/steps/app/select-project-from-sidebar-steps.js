import { clickTrigger, selectChoose, selectSearch } from 'ember-power-select/test-support/helpers';
import { find } from '@ember/test-helpers';
import steps from '../steps';

const SIDEBAR_PROJECT_SELECTOR = 'div.sidebar-form div.input-group';

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
            "User selects project $projectId from sidebar": (assert) => async function (projectId) {
                await clickTrigger(SIDEBAR_PROJECT_SELECTOR);
                await selectChoose(`${SIDEBAR_PROJECT_SELECTOR} > div`, '.ember-power-select-option', projectId - 1);
                assert.ok(true, `User selects project ${projectId} from sidebar`);
            }
        },
        {
            "User searches and selects project \"$label\" from sidebar": (assert) => async function (label) {
                await clickTrigger(SIDEBAR_PROJECT_SELECTOR);
                await selectSearch(SIDEBAR_PROJECT_SELECTOR, label);
                await selectChoose(SIDEBAR_PROJECT_SELECTOR, label);
                assert.ok(true, `User searches and selects project ${label} from sidebar`);
            }
        },
        {
            "User searches for \"$query\" in sidebar project selector": (assert) => async function (query) {
                await clickTrigger(SIDEBAR_PROJECT_SELECTOR);
                await selectSearch(SIDEBAR_PROJECT_SELECTOR, query);
                assert.ok(true, `User searches for ${query} in sidebar project selector`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "Sidebar project selector shows no projects found": (assert) => async function () {
                let noMatches = find('.ember-power-select-option--no-matches-message');
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

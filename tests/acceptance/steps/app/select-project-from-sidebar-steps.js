import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import steps from '../steps';

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
                await clickTrigger('div.sidebar-form div.input-group');
                await selectChoose('div.sidebar-form div.input-group > div', '.ember-power-select-option', projectId - 1);
                assert.ok(true, `User selects project ${projectId} from sidebar`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
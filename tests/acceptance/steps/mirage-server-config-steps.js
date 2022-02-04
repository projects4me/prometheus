import steps from './steps';
import defaultScenario from '../../../mirage/scenarios/default';

export const given = function () {
    return [
        {
            "There is no pre-existing data": (assert) => async function () {
                server.db.emptyData();
                assert.ok(true, "There is no pre-exisiting data");
            }
        },
        {
            "default scenario is loaded": (assert) => async function () {
                defaultScenario(server);
                assert.ok(true, "default data is loaded");
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
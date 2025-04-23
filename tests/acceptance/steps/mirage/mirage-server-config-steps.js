import steps from '../steps';
import defaultScenario from 'prometheus/mirage/scenarios/default';
import projectScenario from 'prometheus/mirage/scenarios/project';

export const given = function () {
    return [
        {
            "There is no pre-existing data": (assert) => async function () {
                server.db.emptyData();
                assert.ok(true, "There is no pre-exisiting data");
            }
        },
        {
            "$scenarioName scenario is loaded": (assert) => async function (scenarioName) {
                switch (scenarioName) {
                    case "default":
                        defaultScenario(server);
                        break;
                    case "project":
                        projectScenario(server);
                        break;
                }
                assert.ok(true, "default data is loaded");
            }
        },
        {
            "There is no $modelType": (assert) => async function (modelType) {
                server.schema[modelType].all().models.forEach((model) => {
                    model.destroy();
                });
            }
        },        
    ];
}

export default function (assert) {
    return steps(assert);
}
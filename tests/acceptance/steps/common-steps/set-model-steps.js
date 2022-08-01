import { setModel } from '../../../helpers/set-details-of-model';
import steps from '../steps';

export const given = function () {
    return [
        {
            "$modelName has following details\n$table": (assert, ctx) => async function (modelName, table) {
                let model = ctx.get(`current${modelName}`);
                setModel(table[0], model);
                assert.ok(true, `${modelName} has following details`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
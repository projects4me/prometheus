import { pluralize } from 'ember-inflector';
import steps from '../steps';

export const given = function () {
    return [
        {
            "$modelName $id has $fieldName $value": (assert, ctx) => async function (modelName, id, fieldName, value) {
                modelName = pluralize(modelName.toLowerCase());

                let model = server.schema[modelName].find(parseInt(id, 10));
                model.update({
                    [fieldName]: value
                });
            }
        }
    ];
}


export default function (assert) {
    return steps(assert);
}
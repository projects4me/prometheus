import { pluralize } from 'ember-inflector';
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

function setModel(modelDetails, model) {
    for (const [fieldName, value] of Object.entries(modelDetails)) {
        if (!isNaN(value)) {
            var [relName, relatedModelName] = getRelatedModelName(fieldName);
            var relValue = server.createList(relatedModelName, parseInt(value));
        } else {
            relName = fieldName;
            relValue = value;
        }
        model.update({
            [relName]: relValue
        });
    }
}

function getRelatedModelName(fieldName) {
    let relName = '';
    let relatedModelName = '';
    let regex = /\([^)]*\)/g;

    //check if user has given relationship name as input or not
    if (regex.test(fieldName)) {
        let splittedString = fieldName.split('(');
        relName = splittedString[0];
        relatedModelName = splittedString[1].slice(0, -1);
    } else {
        relatedModelName = fieldName;
        relName = pluralize(fieldName);
    }

    return [relName, relatedModelName];
}
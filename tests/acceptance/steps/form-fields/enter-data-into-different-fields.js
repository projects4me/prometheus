import steps from '../steps';
import { typeIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User enters $value in $modelName $fieldName $fieldType field": (assert) => async function (value, modelName, fieldName, fieldType) {
                let el = document.querySelector(`[data-field="${modelName}.${fieldName}"] ${fieldType}`);
                el.value = '';
                await typeIn(el, value);
                assert.equal(el.value, value, `User enters ${value} in ${modelName} ${fieldName} ${fieldType} field`)
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
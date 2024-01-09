import steps from '../steps';
import { fillIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User enters $value in $modelName $fieldName $fieldType field": (assert) => async function (value, modelName, fieldName, fieldType) {
                let el = document.querySelector(`[data-field="${modelName}.${fieldName}"] ${fieldType}`);

                await fillIn(el, value);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
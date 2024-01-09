import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User clicks on $buttonType button to change $modelName $fieldName": (assert) => async function (buttonType, modelName, fieldName) {
                let editBtn = document.querySelector(`[data-field="${modelName}.${fieldName}"] [data-btn="${buttonType}"]`);
                await click(editBtn);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
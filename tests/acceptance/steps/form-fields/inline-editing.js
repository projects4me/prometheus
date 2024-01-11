import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User clicks on $buttonType1 button to $buttonType2 $modelName $fieldName": (assert) => async function (buttonType1, buttonType2, modelName, fieldName) {
                let btn = document.querySelector(`[data-field="${modelName}.${fieldName}"] [data-btn="${buttonType1}"]`);
                await click(btn);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
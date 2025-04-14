import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User deletes a $modelName of id $modelId": (assert) => async function (modelName, modelId) {
                let deleteBtn = document.querySelector(`[data-${modelName}-id="${modelId}"] button[data-btn="delete"]`);
                await click(deleteBtn);

                //modal
                let confirmBtn = document.querySelector('[data-action="confirm"] a');
                await click(confirmBtn);

                assert.ok(true, 'User clicks on delete button');
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "$modelName of id $modelId is not present inside list": (assert) => async function (modelName, modelId) {
              assert.dom(`[data-${modelName.toLowerCase()}-id="${modelId}"]`).doesNotExist();
            }
        }
    ];
}
  
export default function (assert) {
    return steps(assert);
}
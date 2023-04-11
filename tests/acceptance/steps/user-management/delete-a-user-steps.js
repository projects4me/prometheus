import steps from '../steps';
import {click} from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User delete a user of id $userId": (assert) => async function (userId) {
                let deleteBtn = document.querySelector(`[data-user-id="${userId}"] button[data-btn="delete"]`);
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
          "User of id 1 is not present inside list": (assert) => async function (userId) {
            assert.dom(`[data-user-id="${userId}"]`).doesNotExist();
          }
      }
  ];
}

export default function (assert) {
    return steps(assert);
}
import steps from '../steps';
import { click, fillIn } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User selects role $roleIndex": (assert) => async function (roleIndex) {
                let roles = document.querySelectorAll('.role-card');
                let roleCardEl = roles[roleIndex - 1];
                await click(roleCardEl);
            }
        },
        {
            "User clicks on edit button to change role $fieldName": (assert) => async function (fieldName) {
                let editBtn = document.querySelector(`[data-field="role.${fieldName}"] [data-btn="edit"]`);
                await click(editBtn);
            }
        },
        {
            "User enters $value in role $fieldName $fieldType field": (assert) => async function (value, fieldName, fieldType) {
                let el = document.querySelector(`[data-field="role.${fieldName}"] ${fieldType}`);

                await fillIn(el, value);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
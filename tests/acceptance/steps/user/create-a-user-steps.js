import steps from '../steps';
import { fillIn, click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User enters following details for a user\n$table": (assert) => async function (table) {
                for (const [key, value] of Object.entries(table[0])) {
                    await fillIn(`[data-field="user.${key}"] input`, value);
                    assert.ok(true, `User ${key} entered`);
                }
            }
        },
        {
            "User selects date of birth": (assert) => async function () {
                await click(`div[data-field="user.dateOfBirth"] > input.ember-text-field`);
                let dateOfBirthEl = document.querySelector('div.daterangepicker[style*="display: block"] > div.drp-calendar > div.calendar-table > table.table-condensed > tbody > tr:nth-child(3) td');
                await click(dateOfBirthEl);
                assert.ok(true, "Date of birth selected");
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
import { click, fillIn } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User clicks on log time": (assert) => async function () {
                await click('a#addLogTime');
                assert.ok(true, 'Edit log time dialog opened');
            }
        },
        {
            "User add following log time for issue\n$table": (assert) => async function (table) {
                for (const [fieldName, value] of Object.entries(table[0])) {
                    await fillIn(`div.${fieldName} input`, value);
                }
                assert.ok(true, "Time details added for issue");
            }
        },
        {
            "User enter $description in description": (assert) => async function (description) {
                await fillIn('textarea', description);
                assert.ok(true, "description for issue time log added");
            }
        },
    ];
}

export const then = function () {
    return [
        {
            "Issue log is $expectedTimeLog": (assert) => async function (expectedTimeLog) {
                assert.dom('span.log-entry').hasText(expectedTimeLog);  
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
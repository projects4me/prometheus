import { click, fillIn } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User clicks on estimate time": (assert) => async function () {
                await click('a#addEstimateTime');
                assert.ok(true, 'Estimate time dialog opened');
            }
        },
        {
            "User enter $description in description for estimate time": (assert) => async function (description) {
                await fillIn('div[data-field="issue.estimateTime"] textarea', description);
                assert.ok(true, "description for issue time log added");
            }
        },
    ];
}

export default function (assert) {
    return steps(assert);
}
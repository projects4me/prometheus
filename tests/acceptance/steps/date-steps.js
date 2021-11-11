import { click } from '@ember/test-helpers';

import steps from './steps';

export const when = function () {
    return [{
        "User selects start date": (assert) => async function () {
            await click ('div[data-field="issue.startDate"] > input.ember-text-field');
            await new Promise(resolve => setTimeout(resolve, 5000));
            await click ('div.daterangepicker > div.drp-calendar > div.calendar-table > table.table-condensed > tbody > tr:nth-child(2) > td:nth-child(2)');
            await new Promise(resolve => setTimeout(resolve, 100000));
            assert.ok(true, "User selects start date");
        }
    }
    ]
}

export default function (assert) {
    return steps(assert);
}
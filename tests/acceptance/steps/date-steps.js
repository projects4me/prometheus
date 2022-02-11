import { click } from '@ember/test-helpers';
import steps from './steps';

export const when = function () {
    return [
        {
            "User selects start date": (assert, ctx) => async function () {
                await click('div[data-field="issue.startDate"] > input.ember-text-field');
                let startDateEl = document.querySelector('div.daterangepicker[style*="display: block"] > div.drp-calendar > div.calendar-table > table.table-condensed > tbody > tr td.today.active');
                await click(startDateEl);
                ctx.set("startDateEl", startDateEl);
                assert.ok(true, "User selects start date");
            }
        },
        {
            "User selects end date": (assert) => async function () {
                await click('div[data-field="issue.endDate"] > input.ember-text-field');
                let endDateEl = document.querySelector('div.daterangepicker[style*="display: block"] > div.drp-calendar > div.calendar-table > table.table-condensed > tbody > tr td.today.active').nextSibling;
                await click(endDateEl);
                assert.ok(true, "User selects end date");
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
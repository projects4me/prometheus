import { click } from '@ember/test-helpers';
import steps from './steps';

export const when = function () {
    return [
        {
            "User selects start date of $module": (assert, ctx) => async function (module) {
                await click(`div[data-field="${module}.startDate"] > input.ember-text-field`);
                let startDateEl = document.querySelector('div.daterangepicker[style*="display: block"] > div.drp-calendar > div.calendar-table > table.table-condensed > tbody > tr td.today.active');
                await click(startDateEl);
                ctx.set("startDateEl", startDateEl);
                assert.ok(true, "User selects start date");
            }
        },
        {
            "User selects end date of $module": (assert) => async function (module) {
                await click(`div[data-field="${module}.endDate"] > input.ember-text-field`);
                let endDateEl = document.querySelector('div.daterangepicker[style*="display: block"] > div.drp-calendar > div.calendar-table > table.table-condensed > tbody > tr td.today.active').parentElement.nextSibling.firstElementChild;
                await click(endDateEl);
                assert.ok(true, "User selects end date");
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
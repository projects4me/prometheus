import { click } from '@ember/test-helpers';
import steps from '../steps';

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
                let endDateEl = document.querySelector('div.daterangepicker[style*="display: block"] > div.drp-calendar > div.calendar-table > table.table-condensed > tbody > tr td.today.active').nextSibling;
                await click(endDateEl);
                assert.ok(true, "User selects end date");
            }
        },
        {
            "User selects spentOn date": (assert) => async function () {
                await click(`div[data-field="issue.detail.timelog.spenton"] > input.ember-text-field`);
                let dateEl = document.querySelector('div.daterangepicker[style*="display: block"] > div.drp-calendar > div.calendar-table > table.table-condensed > tbody > tr td.today.active').nextSibling;
                await click(dateEl);
                assert.ok(true, "User selects spentOn date");
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
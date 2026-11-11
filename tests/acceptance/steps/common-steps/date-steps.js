import { fillIn } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User selects start date of $module": (assert, ctx) => async function (module) {
                await fillIn(`div[data-field="${module}.startDate"] > input`, '2026-01-01');
                ctx.set("startDateEl", '2026-01-01');
                assert.ok(true, "User selects start date");
            }
        },
        {
            "User selects end date of $module": (assert) => async function (module) {
                await fillIn(`div[data-field="${module}.endDate"] > input`, '2026-01-02');
                assert.ok(true, "User selects end date");
            }
        },
        {
            "User selects spentOn date": (assert) => async function () {
                await fillIn(`div[data-field="issue.detail.timelog.spenton"] > input`, '2026-01-02');
                assert.ok(true, "User selects spentOn date");
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}

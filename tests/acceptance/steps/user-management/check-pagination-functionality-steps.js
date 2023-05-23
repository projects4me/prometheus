import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "User clicks on $btnType button": (assert) => async function (btnType) {
                await click(`[data-btn="${btnType}-record"]`);
                assert.ok(true, `User clicks on ${btnType} button`)
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "There will be $count record present inside list view": (assert) => async function (count) {
                assert.dom('tbody tr').exists({ count: parseInt(count) });
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}

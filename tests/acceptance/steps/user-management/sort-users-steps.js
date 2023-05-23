import steps from '../steps';
import { click } from '@ember/test-helpers';

export const when = function () {
    return [
        {
            "$sortAttribute attribute has data of type $sortDataType": (assert, ctx) => async function (sortAttribute, sortDataType) {
                ctx.set('sortDataType', sortDataType);
            }
        },
        {
            "User clicks on $sortAttribute heading to sort in $order order": (assert, ctx) => async function (sortAttribute, order) {
                if (order.toLowerCase() === 'asc') {
                    await click(`[data-sort="${sortAttribute}"] a`);
                }
                await click(`[data-sort="${sortAttribute}"] a`);

                ctx.set('sortDataType', null);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "First record of user $key is $value": (assert) => async function (key, value) {
                assert.dom(`[data-user-field="${key}"]`).hasText(value);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
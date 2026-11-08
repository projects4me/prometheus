import { click, fillIn, settled } from '@ember/test-helpers';
import steps from '../steps';

const LIST = '[data-test-quick-list]';

export const when = function () {
    return [
        {
            "User goes to the next QuickList page": (assert) => async function () {
                await click('[data-quick-list-pagination-next]');
                await settled();
                assert.ok(true, 'next page');
            }
        },
        {
            "User groups the QuickList by $key": (assert) => async function (key) {
                await click('.quick-list-toolbar-group button');
                await click(`[data-test-group-option="${key}"]`);
                await settled();
                assert.ok(true, `grouped by ${key}`);
            }
        },
        {
            "User selects the first $count QuickList rows": (assert) => async function (count) {
                for (let i = 0; i < Number(count); i++) {
                    // The row being selected is re-rendered, so look the checkboxes up again each time
                    await click(document.querySelectorAll(`${LIST} [data-test-quick-list-check]`)[i]);
                    await settled();
                }
                assert.ok(true, `selected ${count}`);
            }
        },
        {
            "User clicks the QuickList $action selection action": (assert) => async function (action) {
                await click(`[data-ui-${action}]`);
                await settled();
                assert.ok(true, `clicked ${action}`);
            }
        },
        {
            "User switches the QuickList to the $state state": (assert) => async function (state) {
                await click(`[data-ui-state="${state}"]`);
                await settled();
                assert.ok(true, `state ${state}`);
            }
        },
        {
            "User filters the QuickList by $text": (assert) => async function (text) {
                await fillIn('[data-ui-filter]', text);
                await settled();
                assert.ok(true, `filtered by ${text}`);
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The QuickList tab is active": (assert) => async function () {
                assert.dom('[data-ui-tab="quick-list"]').hasClass('active');
            }
        },
        {
            "The QuickList shows $count rows": (assert) => async function (count) {
                assert.dom(`${LIST} [data-test-quick-list-item]`).exists({ count: Number(count) });
            }
        },
        {
            "The QuickList pagination reads $text": (assert) => async function (text) {
                assert.dom('[data-quick-list-pagination-range]').hasText(text);
            }
        },
        {
            "The QuickList shows $count groups": (assert) => async function (count) {
                assert.dom(`${LIST} [data-test-quick-list-group]`).exists({ count: Number(count) });
            }
        },
        {
            "The QuickList selection bar counts $text": (assert) => async function (text) {
                assert.dom('[data-quick-list-selection-count]').hasText(text);
            }
        },
        {
            "The QuickList selection bar is hidden": (assert) => async function () {
                assert.dom('[data-quick-list-selection]').doesNotExist();
            }
        },
        {
            "The QuickList shows the $state state": (assert) => async function (state) {
                let selector = {
                    loading: '[data-test-quick-list-skeleton]',
                    empty: '[data-test-quick-list-empty]',
                    error: '[data-test-quick-list-error]'
                }[state];
                assert.dom(selector).exists();
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}

import { click, fillIn, settled } from '@ember/test-helpers';
import steps from '../steps';

const NAV = '[data-developer-nav]';

export const when = function () {
    return [
        {
            "User searches the Developer components for $text": (assert) => async function (text) {
                await fillIn(`${NAV} [data-developer-nav-search] input`, text);
                await settled();
                assert.ok(true, `searched for ${text}`);
            }
        },
        {
            "User follows the Developer link back to the first component": (assert) => async function () {
                await click('[data-developer-back]');
                await settled();
                assert.ok(true, 'followed the link back');
            }
        }
    ];
};

export const then = function () {
    return [
        {
            "The sidebar shows the Developer item": (assert) => async function () {
                assert.dom('.sidebar-menu [data-navigation-module="Developer"]').exists();
            }
        },
        {
            "The sidebar does not show the Developer item": (assert) => async function () {
                assert.dom('.sidebar-menu [data-navigation-module="Developer"]').doesNotExist();
            }
        },
        {
            "The Developer Components box counts $count entries": (assert) => async function (count) {
                assert.dom(`${NAV} [data-developer-nav-count]`).hasText(count);
            }
        },
        {
            "The Developer Components box shows the $name entry under $group": (assert) => async function (name, group) {
                assert.dom(`${NAV} [data-developer-group="${group}"]`).exists();
                assert.dom(`${NAV} [data-developer-item="${name}"]`).exists();
            }
        },
        {
            "The Developer Components box marks the $name entry active": (assert) => async function (name) {
                assert.dom(`${NAV} li.active`).exists({ count: 1 });
                assert.dom(`${NAV} [data-developer-item="${name}"]`).hasClass('active');
            }
        },
        {
            "The Developer Components box shows no entries": (assert) => async function () {
                assert.dom(`${NAV} [data-developer-item]`).doesNotExist();
                assert.dom(`${NAV} [data-developer-nav-empty]`).exists();
            }
        },
        {
            "The Developer page shows the $name entry": (assert) => async function (name) {
                assert.dom(`[data-developer-entry="${name}"]`).exists();
            }
        },
        {
            "The Developer page says the component is not found": (assert) => async function () {
                assert.dom('[data-developer-unknown]').exists();
                assert.dom('[data-developer-unknown] [data-developer-back]').exists();
            }
        }
    ];
};

export default function (assert) {
    return steps(assert);
}

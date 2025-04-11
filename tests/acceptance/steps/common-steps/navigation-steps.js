import { click, currentURL, visit } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User click on $buttonName button": (assert) => async function (buttonName) {
                await click('button[type="submit"]');
                assert.ok(true, `User click on ${buttonName} button`);
            },
        },
        {
            "User navigates to $page": (assert) => async function (page) {
                await visit(`/${page}`);
                assert.equal(currentURL(), `/${page}`, `User navigates to /${page}`);
            }
        },
        {
            "User clicks on the \"$buttonLabel\" button": (assert) => async function (buttonLabel) {
                const buttonMapping = {
                    "mass update issues": "button[data-btn='mass-update-issues']",
                    "select all issues": "[data-select='all']",
                };
                const selector = buttonMapping[buttonLabel];
                await click(selector);
                assert.ok(true, `User clicks on the "${buttonLabel}" button`);
            }
        }
    ];
}

export const then = function () {
    return [
        {
            "User should be in $pageName page": (assert) => async function (pageName) {
                assert.equal(currentURL(), `/${pageName}`, `User should be in a /${pageName} page`);
            }
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
import { click, currentURL, visit } from '@ember/test-helpers';
import steps from './steps';

export const when = function () {
    return [{
        "User click on $buttonName button": (assert) => async function (buttonName) {
            await click('button[type="submit"]');
            assert.ok(true, `User click on ${buttonName} button`);
        },
    },{
        "User navigates to $page": (assert) => async function (page) {
            await visit(`/app/project/10/${page}`); //this thing should be changed in next PR
            assert.equal(currentURL(), `/app/project/10/${page}`, `User navigates to ${page}`);
        }
    }]
}

export const then = function () {
    return [{
        "User should be in $pageName page": (assert) => async function (pageName) {
            assert.equal(currentURL(), `/${pageName}`, `User should be in a ${pageName} page`);
        }
    }]
}

export default function (assert) {
    return steps(assert);
}
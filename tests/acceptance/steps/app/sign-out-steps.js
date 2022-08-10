import { click, currentURL, visit } from '@ember/test-helpers';
import steps from '../steps';

export const when = function () {
    return [
        {
            "User clicks on user menu in navbar": (assert) => async function () {
                await click('li.dropdown.user.user-menu > a');
                assert.ok(true, `User clicks on user menu in navbar`);
            }
        }, { 
            "User clicks on signout button": (assert) => async function () {
                await click('li.user-footer div#btn-signout > a');
                assert.ok(true, `User clicks on signout button`);
            }
        }, { 
            "User navigates to authenticated route": (assert) => async function () {
                await visit('/app/project');
                assert.ok(true, 'User navigates to authenticated route');
            }
        }
    ]
}

export const then = function () {
    return [
        {
            "User is redirected to signin route": (assert) => async function () {
                assert.equal(currentURL(), '/signin', 'User is redirected to signin route');
            }
        }
    ]
}

export default function (assert) {
    return steps(assert);
}
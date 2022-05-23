import { click } from '@ember/test-helpers';
import window from 'ember-window-mock';
import steps from './steps';

export const when = function () {
    return [
        {
            "User clicks on $socialName url, then its url is $expectedUrl": (assert) => async function (socialName, expectedUrl) {
                window.open = (url) => {
                    assert.equal(url, `${expectedUrl}`);
                };
                await click(`div[data-social-name='${socialName}'] > a`);
            },
        }
    ];
}

export default function (assert) {
    return steps(assert);
}
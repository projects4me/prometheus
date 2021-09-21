import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import steps from './steps';

export const when = function () {
    return [{
        "User enters $name in $field": (assert) => async function (name, field) {
            await fillIn(`input#${field}`, name);
            assert.ok(true, `User enters ${name} in ${field}`);
        }
    }]
}

export default function (assert) {
    return steps(assert);
}
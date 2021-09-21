import { currentURL, visit } from '@ember/test-helpers';
import steps from './steps';

// step definitions that are shared between features should be moved to the
// tests/acceptance/steps/steps.js file
export const given = function () {
  return [{
    "User is not logged in": (assert) => async function () {
      debugger;
      await visit('/signin');
      assert.equal(currentURL(), '/signin', "User is not logged in");
    }
  }]

}

export default function (assert) {
  return steps(assert);
}
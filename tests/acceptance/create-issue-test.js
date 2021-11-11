import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import defaultScenario from '../../mirage/scenarios/default';

module('Acceptance | create issue', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /create-issue', async function () {
    defaultScenario(server);
  });
});

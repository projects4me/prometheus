import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import defaultScenario from '../../mirage/scenarios/default';

module('Acceptance | global search', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /global-search', async function(assert) {
    defaultScenario(server);

    await visit('/signin');
    await fillIn('input#username','hammad');
    await fillIn('input#password','hammad');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    assert.equal(currentURL(), '/app');
    //click on search tab
    await click('div.global-search > div');
    await fillIn('div.ember-power-select-search > input','3');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await click('div.ember-power-select-dropdown > ul > li:nth-child(4)');
    await new Promise(resolve => setTimeout(resolve, 2000));
    assert.equal(currentURL(),'/app/project/1/issue/3');
  });
});

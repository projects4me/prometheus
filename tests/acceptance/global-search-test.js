import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | global search', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /global-search', async function(assert) {
    server.createList('token', 1);
    server.createList('user', 10);
    server.createList('dashboard', 10);
    server.createList('project', 10);
    server.createList('role', 5);
    server.createList('milestone', 1);
    server.createList('membership', 1);
    server.createList('issuetype', 1);
    server.createList('issue',5);

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
    console.log(`Current URL is--> ${currentURL()}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    assert.equal(currentURL(),'/app/project/1/issue/3');
  });
});

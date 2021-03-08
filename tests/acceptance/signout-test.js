import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | signout', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /signout', async function (assert) {
    server.createList('token', 1);
    server.createList('user', 10);
    server.createList('dashboard', 10);
    server.createList('project', 10);
    server.createList('role', 5);
    server.createList('milestone', 1);
    server.createList('membership', 1);
    server.createList('issuetype', 1);

    await visit('/signin');
    await fillIn('input#username', 'hammad');
    await fillIn('input#password', 'hammad');
    await click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    assert.equal(currentURL(), '/app');
    
    await click('li.dropdown.user.user-menu > a');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await click('li.user-footer > div.pull-right > a');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await visit('/app/project');
    assert.equal(currentURL(),'/signin');
  });
});

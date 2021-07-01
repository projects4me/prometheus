import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Signin', function(hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    test('visiting /signin', async function(assert) {
        await visit('/signin');
        assert.equal(currentURL(), '/signin');
    });

    test('can login with correct credentials', async function(assert) {
        server.createList('token', 1);
        server.createList('user', 10);
        server.createList('dashboard', 10);
        server.createList('project', 10);
        server.createList('role', 5);
        server.createList('milestone', 1);
        server.createList('membership', 1);
        server.createList('issuetype', 1);

        await visit('/signin');
        await fillIn('input#username','hammad');
        await fillIn('input#password','hammad');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        assert.equal(currentURL(), '/app');

    });

    test('cannot login with incorrect credentials', async function(assert) {
        server.createList('token', 1);
        server.createList('user', 10);
        server.createList('dashboard', 10);
        server.createList('project', 10);
        server.createList('role', 5);
        server.createList('milestone', 1);


        await visit('/signin');
        await fillIn('input#username','hammad');
        await fillIn('input#password','hamma');
        await click('button[type="submit"]');
        assert.equal(currentURL(), '/signin');
    });

});
/* eslint-enable no-undef */
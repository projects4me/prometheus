import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | login', function(hooks) {
    setupApplicationTest(hooks);

    test('visiting /signin', async function(assert) {
        await visit('/signin');
        assert.equal(currentURL(), '/signin');
    });

    test('can login with correct credentials', async function(assert) {
        await visit('/signin');
        await fillIn('input#username','hammad');
        await fillIn('input#password','hammad');
        await click('button[type="submit"]');
        assert.equal(currentURL(), '/app');
    });

    test('cannot login with incorrect credentials', async function(assert) {
        await visit('/signin');
        await fillIn('input#username','hammad');
        await fillIn('input#password','hamma');
        await click('button[type="submit"]');
        assert.equal(currentURL(), '/signin');
    });

});
/* eslint-enable no-undef */
/*
import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { visit, currentURL, andThen } from '@ember/test-helpers';

describe('Acceptance | signin', function() {
    let application;

    beforeEach(function() {
        application = startApp();
    });

    afterEach(function() {
        destroyApp(application);
    });

    it('can visit /signin', function() {
        visit('/signin');

        return andThen(() => {
            expect(currentURL()).to.equal('/signin');
        });
    });

});
*/

import App from '../../app';
import { describe, it } from 'mocha';
import { assert, expect } from 'chai';
import { setupAcceptanceTest } from 'ember-mocha';

const Application = App.extend({ rootElement: '#ember-testing' });
/* eslint-disable no-undef */

describe('Acceptance | Signin', function() {

    setupAcceptanceTest({ Application });

    it('can visit /signin', async function() {
        await visit('/signin');

        andThen(() => {
            expect(currentURL()).to.equal('/signin');
        });
    });

    it('can login with correct credentials', async function(done) {
        this.timeout(10000);
        setTimeout(done, 8000);

        await visit('/signin');
        await fillIn('input#username','hammad');
        await fillIn('input#password','hammad');
        await click('button[type="submit"]');
        assert.equal(currentURL(), '/app');
    });

    it('cannot login with incorrect credentials', async function(done) {
        this.timeout(10000);
        setTimeout(done, 8000);

        await visit('/signin');
        await fillIn('input#username','hammad');
        await fillIn('input#password','hamma');
        await click('button[type="submit"]');
        assert.equal(currentURL(), '/signijn');
    });

});

/* eslint-enable no-undef */
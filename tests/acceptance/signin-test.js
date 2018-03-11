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
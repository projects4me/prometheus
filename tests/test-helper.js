import resolver from './helpers/resolver';
import { setResolver } from 'ember-mocha';
//import { before } from 'mocha';

setResolver(resolver);
/*
before(function() {
    const originalPauseTestHelper = Ember.Test._helpers.pauseTest.method;

    Ember.Test.registerAsyncHelper('pauseMochaTest', (app, context) => {
        context.timeout(0);

        return originalPauseTestHelper();
    });
});
*/

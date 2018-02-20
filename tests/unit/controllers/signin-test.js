import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('SigninController', function() {
    setupTest('controller:signin', {
        // Specify the other units that are required for this test.
        needs: ['service:session']
    });

    /**
     * Making sure that the function exists
     */
    it('exists', function() {
        let controller = this.subject();
        expect(controller).to.be.ok;
    });

});
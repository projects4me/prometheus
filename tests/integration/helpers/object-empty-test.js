import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';


describe('Integration | Helper | object-empty', function() {
    setupComponentTest('object-empty', {
        integration: true
    });

    let scenarios = [
        [{}, 'true'],
        [{something:"Else"}, 'false'],
    ];

    scenarios.forEach(function (scenario) {
        it('renders '+scenario[0], function() {
            this.set('inputValue', scenario[0]);
            this.render(hbs`{{object-empty inputValue}}`);
            expect(this.$().text().trim()).to.equal(scenario[1]);
        });
    });

});

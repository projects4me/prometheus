import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';


describe('Integration | Helper | if-match', function() {
    setupComponentTest('if-match', {
        integration: true
    });

    let scenarios = [
        [[1], [1], 'false'],
        [[], {}, 'false'],
        [{something:"Else"}, {something:"Else"}, 'false'],
        [{something:"Else"}, {something1:"Else"}, 'false'],
        ["Else", "Else", 'true'],
        ["else", "Else", 'false'],
        ["Something", "Else", 'false'],
        [1, 1, 'true'],
        [1, '1', 'false']
    ];

    scenarios.forEach(function (scenario) {
        it('matches '+scenario[0]+' '+scenario[1], function() {
            this.set('a', scenario[0]);
            this.set('b', scenario[1]);
            this.render(hbs`{{if-match a b}}`);
            expect(this.$().text().trim()).to.equal(scenario[2]);
        });
    });

});

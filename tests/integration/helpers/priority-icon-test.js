import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';


describe('Integration | Helper | priority-icon', function() {
    setupComponentTest('priority-icon', {
        integration: true
    });

    let scenarios = [
        ['blocker', '<i class="fa fa-ban"></i>'],
        ['critical', '<i class="fa fa-angle-double-up"></i>'],
        ['high', '<i class="fa fa-arrow-up"></i>'],
        ['medium', '<i class="fa fa-dot-circle-o"></i>'],
        ['low', '<i class="fa fa-arrow-down"></i>'],
        ['lowest', '<i class="fa fa-angle-double-down"></i>'],
        ['loweste', ''],
        ['', ''],
    ];

    scenarios.forEach(function (scenario) {
        it('renders '+scenario[0], function() {
            this.set('inputValue', scenario[0]);
            this.render(hbs`{{priority-icon inputValue}}`);
            expect(this.$().html().trim()).to.equal(scenario[1]);
        });
    });

});

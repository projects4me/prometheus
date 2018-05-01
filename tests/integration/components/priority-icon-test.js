import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | priority-icon', function() {
    setupComponentTest('priority-icon', {
        integration: true
    });

    let scenarios = [
        ['blocker', /fa fa-ban ember-view/],
        ['critical', /fa fa-angle-double-up ember-view/],
        ['high', /fa fa-arrow-up ember-view/],
        ['medium', /fa fa-dot-circle-o ember-view/],
        ['low', /fa fa-arrow-down ember-view/],
        ['lowest', /fa fa-angle-double-down ember-view/],
        ['loweste', /fa ember-view/],
        ['', /fa ember-view/],
    ];

    scenarios.forEach(function (scenario) {
        it('renders '+scenario[0], function() {
            this.set('inputValue', scenario[0]);
            this.render(hbs`{{priority-icon priority=inputValue}}`);
            expect(this.$().html().trim()).to.match(scenario[1]);
        });
    });

});

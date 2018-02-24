import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | file-size', function() {
    setupComponentTest('file-size', {
        integration: true
    });

    let scenarios = [
        ['0', '0.00 B'],
        ['1023', '1023.00 B'],
        ['1024', '1.00 KB'],
        ['1048570', '1023.99 KB'],
        ['1048576', '1.00 MB'],
        ['1073736581', '1023.99 MB'],
        ['1073741824', '1.00 GB'],
        ['1099506259066', '1023.99 GB'],
        ['1099511627776', '1.00 TB'],
        ['1125894409099999', '1023.99 TB'],
        ['1125899906842624', '1.00 PB'],
        ['-1', '-1.00 B'],
    ];

    scenarios.forEach(function (scenario) {
        it('File Size for '+scenario[0], function() {
            this.set('inputValue', scenario[0]);
            this.render(hbs`{{file-size inputValue}}`);
            expect(this.$().text().trim()).to.equal(scenario[1]);
        });
    });

});


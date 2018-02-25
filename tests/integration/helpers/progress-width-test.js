import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | progress-width', function() {
  setupComponentTest('progress-width', {
    integration: true
  });

  it('renders', function() {
    this.set('inputValue', '1234');

    this.render(hbs`{{progress-width inputValue}}`);

    expect(this.$().text().trim()).to.equal('width:1234%');
  });
});


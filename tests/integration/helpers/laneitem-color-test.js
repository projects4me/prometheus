import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | laneitem-color', function() {
  setupComponentTest('laneitem-color', {
    integration: true
  });

  it('renders for op1', function() {
    this.set('inputValue', '1234');

    this.render(hbs`{{laneitem-color inputValue}}`);

    expect(this.$().text().trim()).to.equal('border-left-color: rgba(210, 121, 194, 1)');
  });

  it('renders for op1', function() {
      this.set('a', '1234');
      this.set('b', '0.5');

      this.render(hbs`{{laneitem-color a b}}`);

      expect(this.$().text().trim()).to.equal('border-left-color: rgba(210, 121, 194, 0.5)');
  });

});


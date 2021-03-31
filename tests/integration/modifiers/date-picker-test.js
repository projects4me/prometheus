import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, focus, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { doc } from 'prettier';

module('Integration | Modifier | date-picker', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    await render(hbs`
      <FormFields::FieldDate
      @placeholder="Select end date"
      @label="End Date"
      @format="YYYY-MM-DD"
      @singleDatePicker={{true}}
      @showDropdowns={{true}}
      @autoApply={{false}}
      @minDate='1990'                                                   
      />
    `);

    await focus('input.form-control');
    assert.equal(document.querySelector('div.drp-buttons > button.applyBtn').getAttribute('class'),'applyBtn btn btn-sm btn-primary');

    assert.equal(document.querySelector('select.yearselect > option').getAttribute('value'),'1990');
    await render(hbs`
    <div id='clickOutside'> 
    </div>
  `);
  await click('div#clickOutside');
  });
});

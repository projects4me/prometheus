import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, blur, focus, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | field-date', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {

    await render(hbs`
      <FormFields::FieldDate
      @placeholder="Select end date"
      @label="End Date"
      @format="YYYY-MM-DD"
      @singleDatePicker={{true}}
      @showDropdowns={{true}}
      @autoApply={{true}}                                                   
      />
    `);

    await new Promise(resolve => setTimeout(resolve, 1000));
    assert.equal(this.element.querySelector('input.form-control').placeholder, 'Select end date');
    await focus('input.form-control');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await blur('input.form-control');
    assert.equal(document.querySelector('div.show-calendar').getAttribute('class'), 'daterangepicker ltr auto-apply single opensright show-calendar');
    await render(hbs`
      <div id='clickOutside'> 
      </div>
    `);
    await click('div#clickOutside');
    assert.equal(window.getComputedStyle(document.querySelector('div.show-calendar')).getPropertyValue('display'),'none');
    document.querySelector('div.show-calendar').remove();
  });
});

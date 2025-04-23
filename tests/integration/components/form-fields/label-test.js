import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form-fields/label', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders component', async function(assert) {
    await render(hbs`<FormFields::Label />`);

    assert.dom('[data-form-field="label"]').exists();
  });

  test('it renders component with given label', async function(assert) {
    await render(hbs`<FormFields::Label @label="Test Label"/>`);

    assert.dom('[data-form-field="label"] label').hasText('Test Label');
  }); 
  
  test('it renders label that show the field is required', async function(assert) {
    await render(hbs`<FormFields::Label @required={{true}}/>`);

    assert.dom('[data-form-field="label"] label span').hasText('*');
  });
});

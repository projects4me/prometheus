import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
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

  test('a hidden info bubble stays hidden after re-render', async function(assert) {
    localStorage.removeItem('field-info-hidden');
    this.set('show', true);
    await render(hbs`{{#if this.show}}<FormFields::Label @showFieldInfo={{true}} @info="Help" @data-field="x.a" />{{/if}}`);

    assert.dom('[data-field-label="info"]').exists();
    await click('[data-label-info="btn"]');
    assert.dom('[data-field-label="info"]').doesNotExist();

    this.set('show', false);
    this.set('show', true);
    await settled();
    assert.dom('[data-field-label="info"]').doesNotExist();

    await click('[data-label-info="btn"]');
    assert.dom('[data-field-label="info"]').exists();
    localStorage.removeItem('field-info-hidden');
  });
});

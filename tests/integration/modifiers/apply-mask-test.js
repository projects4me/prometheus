import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | apply-mask', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    await render(hbs`
    <FormFields::FieldText
    @placeholder={{t "views.app.issue.create.placeholder.subject"}}
    @label={{t "views.app.issue.create.subject"}}
    @value="1a2b3c"
    @mask="alpha"
    />
    `);
    await new Promise(resolve => setTimeout(resolve, 2000));
    assert.equal(document.querySelector('input.form-control').value,'abc');

    await render(hbs`
    <Input
    id='test'
    {{apply-mask "alpha"}}
    />
    `);

    await fillIn('input#test','a1b2c3');
    await new Promise(resolve => setTimeout(resolve, 2000));
    assert.equal(document.querySelector('input#test').value,'abc');
  });
});

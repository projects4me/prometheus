import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, blur, focus } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | field-text', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    await render(hbs`
    <FormFields::FieldText
    @placeholder={{t "views.app.issue.create.placeholder.subject"}}
    @label={{t "views.app.issue.create.subject"}}
    @mask="alpha"
    />
    `);
    
    assert.equal(this.element.querySelector('input.form-control').placeholder, 'Enter the issue subject ..');
    assert.equal(this.element.querySelector('label').innerHTML, 'Subject');
    await focus('input.form-control');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await blur('input.form-control');
    await new Promise(resolve => setTimeout(resolve, 3000));
    assert.equal(this.element.querySelector('span.error').getAttribute('class'),'error text-red');
  });
});

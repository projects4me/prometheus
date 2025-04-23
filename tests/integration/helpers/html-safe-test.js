import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | html-safe', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders HTML safely', async function(assert) {
    this.set('inputValue', '<strong>Safe HTML</strong>');

    await render(hbs`{{html-safe this.inputValue}}`);
    assert.equal(this.element.innerHTML.trim(), '<strong>Safe HTML</strong>');
  });

  test('it handles empty strings', async function(assert) {
    this.set('inputValue', '');

    await render(hbs`{{html-safe this.inputValue}}`);
    assert.equal(this.element.textContent.trim(), '');
  });

  test('it handles null values', async function(assert) {
    this.set('inputValue', null);

    await render(hbs`{{html-safe this.inputValue}}`);
    assert.equal(this.element.textContent.trim(), '');
  });
});

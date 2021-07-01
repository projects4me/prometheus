import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | application-header', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {

    let session = {
      isAuthenticated:true
    }

    this.set('session',session);

    // Template block usage:
    await render(hbs`
      <AppLayouts::ApplicationHeader
      @session = {{this.session}}
      />
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
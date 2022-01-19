import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | lock-item', function(hooks) {
  setupRenderingTest(hooks);

  test('lock item modifier', async function(assert) {
    await render(hbs
      `<div class="item">
        <div class="overlay" {{lock-item}}> </div>
      </div>`);

    let el = document.querySelector('div.item');
    assert.equal(el.style.pointerEvents, "none");
  });
});

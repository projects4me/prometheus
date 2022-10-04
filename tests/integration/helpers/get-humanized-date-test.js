/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | get-humanized-date', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('date', '2015-11-20 22:03:22.0');

    await render(hbs`{{get-humanized-date this.date}}`);

    assert.dom(this.element).hasText('20 November 2015');
  });
});

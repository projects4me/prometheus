/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | message-box', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders component', async function(assert) {
    let save = () => true;
    this.set('save', save);

    await render(hbs`
        <ConversationUi::MessageBox
            @save={{this.save}}
        />
    `);

    assert.dom('div.tui-editor-contents.tui-editor-contents-placeholder').hasAttribute('contenteditable', 'true', 'toast ui editor exists')
    assert.dom('button.btn.btn-primary').hasText('Post', 'post button exists');
  });
});

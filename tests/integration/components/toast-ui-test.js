/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | toast-ui', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders component', async function (assert) {
        let onContentChange = () => true;
        let model = {
            description: "321"
        }
        this.set('onContentChange', onContentChange);
        this.set('model', model);

        await render(hbs`
            <AppUi::ToastUi 
                @hide={{array 'footer'}}
                @onContentChange={{this.onContentChange}}
            />
        `)

        assert.dom('div#editor').exists('component rendered');
        assert.dom('div.tui-editor-contents.tui-editor-contents-placeholder').exists('toast modifier works');
        assert.dom('div[data-tribute="true"]').exists('tribute attached to editor');
    });
});

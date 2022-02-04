/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | initialize-toastui', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let onContentChange = () => true;
        this.set('onContentChange', onContentChange);

        await render(hbs`
            <div {{initialize-toastui onContentChange=this.onContentChange}}> </div>
        `);

        assert.ok(true);
    });
});

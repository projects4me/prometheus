/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | initialize-slimscroll', function (hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it renders element by attaching slim scroll to it', async function (assert) {
        await render(hbs`
            <div style="height:300px;width:300px" {{initialize-slimscroll }}>
                Slim scroll test
            </div>
        `);
        
        assert.dom('div.slimScrollDiv').exists();
    });
});

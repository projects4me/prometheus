/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | charts/open-closed-chart', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders open closed component', async function (assert) {
        await render(hbs`
            <Charts::OpenClosedChart 
            />
        `);

        assert.dom('canvas').exists();
    });
});

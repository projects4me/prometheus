/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | exceptions/nothing-found', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders component', async function (assert) {

        await render(hbs`
            <Exceptions::NothingFound
                @description="Project not found"
            />
        `);

        assert.dom('i.fa.fa-info-circle').exists();
        assert.dom('div.description').hasText('Project not found');
    });
});

/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | apply-mask', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        await render(hbs`
            <FormFields::FieldText
                @placeholder="subject"
                @label="subject"
                @value="1a2b3c"
                @mask="alpha"
            />
        `);
        assert.dom('input.form-control').hasValue('abc');

        await render(hbs`
            <Input
                id='test'
                {{apply-mask "alpha"}}
            />
        `);

        await fillIn('input#test', 'a1b2c3');
        assert.dom('input#test').hasValue('abc');
    });
});

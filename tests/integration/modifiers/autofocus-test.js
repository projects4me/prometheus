/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | autofocus', function (hooks) {
    setupRenderingTest(hooks);

    test('Attach autofocus modifier to a form field by setting shouldFocus to True', async function (assert) {
        let focus = true;

        this.set('focus', focus);
        await render(hbs`
            <FormFields::FieldText
                @focus={{this.focus}}
            />
        `);
        assert.true($("input.form-control").is(":focus"), 'Field is focused');
        
    });

    test('Attach autofocus modifier to a form field by setting shouldFocus to False', async function (assert) {
        let focus = false;

        this.set('focus', focus);
        await render(hbs`
            <FormFields::FieldText
                @focus={{this.focus}}
            />
        `);
        assert.false($("input.form-control").is(":focus"), 'Field is focused');
        
    });
});

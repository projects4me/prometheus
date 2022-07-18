/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, blur, focus } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | field-text', function (hooks) {
    setupRenderingTest(hooks);

    test('Text field Renders', async function (assert) {

        await render(hbs`
            <FormFields::FieldText
                @placeholder="Enter the issue subject .."
                @label="Subject"
                @mask="alpha"
            />
        `);

        assert.equal(this.element.querySelector('input.form-control').placeholder, 'Enter the issue subject ..');
        assert.equal(this.element.querySelector('label').innerHTML, 'Subject');
        await focus('input.form-control');
        await blur('input.form-control');
        assert.equal(this.element.querySelector('span.error').getAttribute('class'), 'error text-red');
    });
});

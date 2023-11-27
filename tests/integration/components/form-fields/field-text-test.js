/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, blur, focus } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | field-text', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders field text component', async function (assert) {
        this.owner.register('service:acl', AclStub);

        await render(hbs`
            <FormFields::FieldText
                @placeholder="Enter the issue subject .."
                @label="Subject"
                @mask="alpha"
                @message="This field is required"
            />
        `);

        assert.equal(this.element.querySelector('input.form-control').placeholder, 'Enter the issue subject ..');
        assert.equal(this.element.querySelector('label').innerHTML, 'Subject');
        await focus('input.form-control');
        await blur('input.form-control');
        assert.equal(this.element.querySelector('span.error').getAttribute('class'), 'error text-red');
    });
});

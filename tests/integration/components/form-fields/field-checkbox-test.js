/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | form-fields/field-checkbox', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders checkbox component', async function (assert) {
        this.owner.register('service:acl', AclStub);
        
        let select = () => true;

        this.set('select', select);
        
        await render(hbs`
            <FormFields::FieldCheckbox
                @select={{this.select}}
            />
        `);

        assert.dom('input[type="checkbox"]').exists();
    });
});

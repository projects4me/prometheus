/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, blur, focus, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | field-date', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        this.owner.register('service:acl', AclStub);
        
        await render(hbs`
            <FormFields::FieldDate
                @placeholder="Select end date"
                @label="End Date"
                @format="YYYY-MM-DD"
                @singleDatePicker={{true}}
                @showDropdowns={{true}}
                @autoApply={{true}}                                                   
            />
        `);

        assert.equal(this.element.querySelector('input.form-control').placeholder, 'Select end date');
        await focus('input.form-control');
        await blur('input.form-control');
        assert.equal(document.querySelector('div.show-calendar').getAttribute('class'), 'daterangepicker ltr auto-apply single opensright show-calendar');

        await render(hbs`
            <div id='clickOutside'> </div>
        `);

        await click('div#clickOutside');
        assert.equal(window.getComputedStyle(document.querySelector('div.show-calendar')).getPropertyValue('display'), 'none');
        document.querySelector('div.show-calendar').remove();
    });
});

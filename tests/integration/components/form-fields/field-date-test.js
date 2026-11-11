/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | field-date', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
    });

    test('it renders a native date input with value, min and max', async function (assert) {
        await render(hbs`
            <FormFields::FieldDate @placeholder="Select end date" @label="End Date" @value="2026-03-04"
                @minDate="2026-01-01" @maxDate="2026-12-31" />
        `);

        const input = this.element.querySelector('input[type="date"].form-control');
        assert.equal(input.value, '2026-03-04');
        assert.equal(input.min, '2026-01-01');
        assert.equal(input.max, '2026-12-31');
    });

    test('it calls @update with YYYY-MM-DD and with an empty string when cleared', async function (assert) {
        const seen = [];
        this.set('update', (v) => seen.push(v));
        await render(hbs`<FormFields::FieldDate @label="Date" @update={{this.update}} />`);

        await fillIn('input[type="date"]', '2026-05-06');
        await fillIn('input[type="date"]', '');
        assert.deepEqual(seen, ['2026-05-06', '']);
    });

    test('DD-MM renders day and month selects and rejects invalid combinations', async function (assert) {
        this.set('value', '');
        this.set('update', (v) => this.set('value', v));
        await render(hbs`<FormFields::FieldDate @label="Birthday" @format="DD-MM" @value={{this.value}} @update={{this.update}} />`);

        await fillIn('select[data-part="day"]', '31');
        await fillIn('select[data-part="month"]', '5');
        assert.equal(this.value, '31-05');

        await fillIn('select[data-part="month"]', '2');
        assert.equal(this.value, '', '31-02 is not allowed');
        assert.equal(this.element.querySelectorAll('select[data-part="day"] option').length, 30, 'February has 29 days plus a blank');
    });
});

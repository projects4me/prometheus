/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
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

module('Integration | Component | form-fields/field-checkbox labelled', function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
        this.owner.register('service:acl', AclStub);
    });

    test('without @label the output stays bare', async function (assert) {
        await render(hbs`<FormFields::FieldCheckbox @select={{this.select}} />`);

        assert.dom('.checkbox').doesNotExist();
        assert.dom('label').doesNotExist();
    });

    test('with @label it renders the awesome-bootstrap markup', async function (assert) {
        await render(hbs`<FormFields::FieldCheckbox @label="Mine" />`);

        assert.dom('div.checkbox.checkbox-primary input[type="checkbox"]').exists();
        assert.dom('div.checkbox label').hasText('Mine');
        const id = this.element.querySelector('input').id;
        assert.ok(id);
        assert.dom('label').hasAttribute('for', id);
    });

    test('clicking the label toggles the input and fires @select', async function (assert) {
        let fired = 0;
        this.set('select', () => fired++);

        await render(hbs`<FormFields::FieldCheckbox @label="Mine" @select={{this.select}} />`);
        await click('label');

        assert.dom('input').isChecked();
        assert.strictEqual(fired, 1);
    });

    test('attributes reach the input and @disabled disables it', async function (assert) {
        await render(hbs`<FormFields::FieldCheckbox @label="Mine" @disabled={{true}} data-test-x="y" />`);

        assert.dom('input').hasAttribute('data-test-x', 'y');
        assert.dom('input').isDisabled();
    });

    test('the crimson root class does not need a .form-field parent', async function (assert) {
        await render(hbs`<FormFields::FieldCheckbox @label="Mine" />`);

        assert.dom('.form-field').doesNotExist();
        assert.dom('div.checkbox.checkbox-primary.form-checkbox').exists();
        assert.dom('.form-checkbox-sm').doesNotExist();
    });

    test('@size="sm" adds the small class', async function (assert) {
        await render(hbs`<FormFields::FieldCheckbox @label="Mine" @size="sm" />`);

        assert.dom('div.form-checkbox.form-checkbox-sm').exists();
    });
});

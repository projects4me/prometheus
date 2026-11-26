/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';
import { placeholderSelector, searchSelect, selectOptionTexts } from 'prometheus/tests/helpers/select';

module('Integration | Component | form-fields/field-relate-multi', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders field-relate-multi component', async function (assert) {
        this.owner.register('service:acl', AclStub);

        let options = [
            {
                label: "Value1"
            },
            {
                label: "Value2"
            },
            {
                label: "Value3"
            },
            {
                label: "Value4"
            }
        ]
        let selectedOptions = [
            {
                label: "Value3"
            },
            {
                label: "Value2"
            }
        ]

        this.set('onchange', () => true);
        this.set('availableOptions', options);
        this.set('selectedOptions', selectedOptions);

        await render(hbs`
            <FormFields::FieldRelateMulti
                @relateType="relate-simple"
                @onchange={{this.onchange}}
                @options={{this.availableOptions}}
                @selected={{this.selectedOptions}}
            />
        `);

        //checking selected options
        let selectedOptionEls = this.element.querySelectorAll('span.relate-simple');
        selectedOptionEls.forEach((el, i) => {
            assert.dom(el).hasText(selectedOptions[i].label);
        });

    });

    test('it renders the component by given placeholder and label', async function (assert) {
        this.owner.register('service:acl', AclStub);
        let onchange = () => true;
        this.set('onchange', onchange);

        await render(hbs`
            <FormFields::FieldRelate
                @placeholder="Select Issue types"
                @label="Issue Types"
                @onchange={{this.onchange}}
            />
        `);

        //checking placeholder and label
        assert.dom(placeholderSelector()).hasText('Select Issue types');
        assert.dom('label').hasText('Issue Types');
    });
    module('@onCreate', function (hooks) {
        hooks.beforeEach(async function () {
            this.owner.register('service:acl', AclStub);
            this.set('options', [{ label: 'Bug' }, { label: 'Feature' }]);
            this.set('created', []);
            this.set("selected", []);
            this.set('changed', 0);
            this.set('onchange', () => this.set('changed', this.changed + 1));
            this.set('onCreate', (text) => this.created.push(text));
        });

        const renderField = (withCreate) => withCreate
            ? hbs`<FormFields::FieldRelateMulti @relateType="relate-simple" @searchEnabled={{true}} @searchField="label" @options={{this.options}} @selected={{this.selected}} @onchange={{this.onchange}} @onCreate={{this.onCreate}} />`
            : hbs`<FormFields::FieldRelateMulti @relateType="relate-simple" @searchEnabled={{true}} @searchField="label" @options={{this.options}} @selected={{this.selected}} @onchange={{this.onchange}} />`;

        test('it shows the Add option first for new text', async function (assert) {
            await render(renderField(true));
            await searchSelect(this.element, '  Docs ');
            assert.strictEqual(selectOptionTexts()[0], 'Add “Docs”');
        });

        test('it hides the Add option on an exact match, ignoring case', async function (assert) {
            await render(renderField(true));
            await searchSelect(this.element, 'bug');
            assert.deepEqual(selectOptionTexts(), ['Bug']);
        });

        test('Enter adds the typed text', async function (assert) {
            await render(renderField(true));
            await searchSelect(this.element, 'Docs');
            await triggerKeyEvent('.ember-power-select-trigger-multiple-input', 'keydown', 'Enter');
            assert.deepEqual(this.created, ['Docs']);
            assert.strictEqual(this.changed, 0);
        });

        test('it does not offer Add without @onCreate', async function (assert) {
            await render(renderField(false));
            await searchSelect(this.element, 'Docs');
            assert.deepEqual(selectOptionTexts(), ['No results found']);
        });
    });
});
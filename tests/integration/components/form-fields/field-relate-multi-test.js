/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form-fields/field-relate-multi', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders field-relate-multi component', async function (assert) {
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
        assert.dom('.ember-power-select-placeholder').hasText('Select Issue types');
        assert.dom('label').hasText('Issue Types');
    });
});
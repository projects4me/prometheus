/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | field-relate', function (hooks) {
    setupRenderingTest(hooks);

    let relatedFields = [
        {
            name: "issue",
            type: "relate-issue",
            options: [
                {
                    name: "Task board Issue",
                    number: "3199"
                },
                {
                    name: "Upgrade Testing",
                    number: "3200"
                }
            ],
            selected: {
                name: "Upgrade Testing",
                number: "3200"
            },
            selector: "span.relate-issue",
            expectedValue: "#3200 - Upgrade Testing"
        },
        {
            name: "issuepriority",
            type: "relate-issuepriority",
            options: [
                {
                    label: "Low",
                    value: "Low"
                },
                {
                    label: "Medium",
                    value: "Medium"
                }
            ],
            selected: {
                label: "Low",
                value: "Low"
            },
            selector: "span.relate-issuepriority",
            expectedValue: "Low"
        },
        {
            name: "simple",
            type: "relate-simple",
            options: [
                {
                    label: "Value1"
                },
                {
                    label: "Value2"
                }
            ],
            selected: {
                label: "Value2"
            },
            selector: "span.relate-simple",
            expectedValue: "Value2"
        },
        {
            name: "user",
            type: "relate-user",
            options: [
                {
                    label: "Hammad Hassan"
                },
                {
                    label: "Rana Nouman"
                }
            ],
            selected: {
                label: "Hammad Hassan"
            },
            selector: "span.relate-user span.username",
            expectedValue: "Hammad Hassan"
        }
    ];

    relatedFields.forEach((relatedField) => {
        test(`it renders component of type relate ${relatedField.name}`, async function (assert) {
            this.set('options', relatedField.options);
            this.set('onchange', () => true);
            this.set('selected', relatedField.selected);
            this.set('relateType', `relate-${relatedField.name}`);

            await render(hbs`
                <FormFields::FieldRelate
                    @onchange={{this.onchange}}
                    @options={{this.options}}
                    @selected={{this.selected}}
                    @relateType={{this.relateType}}
                />
            `);

            assert.dom(`span.ember-power-select-selected-item > ${relatedField.selector}`).hasText(`${relatedField.expectedValue}`)

        });
    });

    test('it renders the component by given placeholder and label', async function (assert) {
        let onchange = () => true;
        this.set('onchange', onchange);

        await render(hbs`
            <FormFields::FieldRelate
                @placeholder="Issue Status"
                @label="Issue Status"
                @onchange={{this.onchange}}
            />
        `);

        assert.dom('span.ember-power-select-placeholder').hasText('Issue Status', 'placeholder matched');
        assert.dom('label').hasText('Issue Status', 'label matched');
    });
});
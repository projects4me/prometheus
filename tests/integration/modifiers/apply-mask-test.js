/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../stub-services/acl-stub';

module('Integration | Modifier | apply-mask', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        this.owner.register('service:acl', AclStub);
        await render(hbs`
            <FormFields::FieldText
                @placeholder="subject"
                @label="subject"
                @value="1a2b3c"
                @mask="alpha"
            />
        `);
        assert.dom('input.form-control').hasValue('abc');

        await render(hbs`
            <Input
                id='test'
                {{apply-mask "alpha"}}
            />
        `);

        await fillIn('input#test', 'a1b2c3');
        assert.dom('input#test').hasValue('abc');
    });

    const cases = {
        alpha: ['a1 B-2c_', 'a Bc'],
        alphanumeric: ['a1 B-2c_é', 'a1 B2c'],
        email: ['a.b+c-d@e_f g!#', 'a.b+c-d@e_fg'],
    };

    Object.entries(cases).forEach(([mask, [input, expected]]) => {
        test(`${mask} drops disallowed characters on typing and paste`, async function (assert) {
            this.mask = mask;
            await render(hbs`<input id="test" {{apply-mask this.mask}} />`);

            await fillIn('#test', input);
            assert.dom('#test').hasValue(expected, 'typed');

            const el = document.querySelector('#test');
            el.value = '';
            // a paste lands as one input event carrying the whole text
            el.value = input;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            assert.dom('#test').hasValue(expected, 'pasted');
        });
    });

    test('it keeps the caret and fires input so bindings update', async function (assert) {
        await render(hbs`<input id="test" {{apply-mask "alpha"}} />`);
        const el = document.querySelector('#test');
        el.focus();
        el.value = 'ab1cd';
        el.setSelectionRange(3, 3);
        let events = 0;
        el.addEventListener('input', () => events++);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        assert.strictEqual(el.value, 'abcd');
        assert.strictEqual(el.selectionStart, 2);
        assert.ok(events >= 2, 'a corrective input event fired');
    });
});

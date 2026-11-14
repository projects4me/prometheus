/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | checkbox-field', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders a checkbox with the passed attributes', async function (assert) {
        await render(hbs`<CheckboxField data-select="all" />`);

        assert.dom('input[type=checkbox]').hasAttribute('data-select', 'all');
        assert.dom('input[type=checkbox]').isNotChecked();
    });

    test('it reports the checked state on change', async function (assert) {
        let values = [];
        this.set('onChange', (value) => values.push(value));

        await render(hbs`<CheckboxField @onChange={{this.onChange}} data-select="12" />`);
        await click('input');
        await click('input');

        assert.deepEqual(values, [true, false]);
    });

    test('it toggles without an @onChange', async function (assert) {
        await render(hbs`<CheckboxField />`);
        await click('input');

        assert.dom('input').isChecked();
    });
});

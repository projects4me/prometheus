/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form-fields/field-text-area', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders text area component', async function (assert) {

        await render(hbs`
            <FormFields::FieldTextArea
                @placeholder="Enter the subject .."
                @data-field="issue.subject"
                @label="Subject"
            />
        `);

        assert.dom('div[data-field="issue.subject"]').exists();
        assert.dom('label').hasText('Subject');
        assert.equal(this.element.querySelector('.form-control.data-input').placeholder, 'Enter the subject ..');

    });
});

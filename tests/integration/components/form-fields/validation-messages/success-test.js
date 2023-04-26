import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form-fields/validation-messages/success', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        await render(hbs`
            <FormFields::ValidationMessages::Success
                @message="success message"
            />
        `);
        assert.dom('i.fa.fa-check-circle').exists();
        assert.dom('span.success').hasText('success message');
    });
});

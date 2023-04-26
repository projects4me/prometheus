import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form-fields/validation-messages', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders component with a success message', async function (assert) {
        await render(hbs`
            <FormFields::ValidationMessages
                @isSuccessful={{true}}
                @message="success message"
            />
        `);
        assert.dom('i.fa.fa-check-circle').exists();
        assert.dom('span.success').hasText('success message');
    });

    test('it renders component with a failure message', async function (assert) {
        await render(hbs`
            <FormFields::ValidationMessages
                @isSuccessful={{false}}
                @message="failure message"
            />
        `);
        assert.dom('i.fa.fa-exclamation-circle').exists();
        assert.dom('span.error').hasText('failure message');
    });    
});

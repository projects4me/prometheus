import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form-fields/validation-messages/failure', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        await render(hbs`
            <FormFields::ValidationMessages::Failure
                @message="failure message"
            />
        `);

        assert.dom('i.fa.fa-exclamation-circle').exists();
        assert.dom('span.error').hasText('failure message');
    });
});

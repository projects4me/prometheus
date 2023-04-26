import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user/create/username', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {

        await render(hbs`
            <User::Create::Username
                @placeholder="Enter username"
            />
        `);

        assert.dom('[data-field="user.username"]').exists();
        assert.dom('[data-field="user.username"] input').hasAttribute('placeholder', "Enter username");
    });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | get-permission-options', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders helper with input "api"', async function (assert) {
        await render(hbs`
            <Role::PermissionOptions
                @options={{get-permission-options 'api'}}
            />
        `);

        assert.dom('select').exists();
        assert.dom('option').exists({ count: 5 });
    });
});

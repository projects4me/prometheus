import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | role/permission-options', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        await render(hbs`
            <Role::PermissionOptions
                @options={{get-permission-options 'api'}}
            />
        `);
        assert.dom('option').exists({ count: 5 });
    });
});

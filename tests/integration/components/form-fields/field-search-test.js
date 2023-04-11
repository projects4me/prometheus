import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form-fields/field-search', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders search box component', async function (assert) {
        this.set('searchFunction', () => true);

        await render(hbs`
            <FormFields::FieldSearch
                @placeholder="Search User .."
                @data-module="user-management"
                @searchFunction={{this.searchFunction}}
            />
        `);

        assert.dom('[data-module="user-management"] input').exists();
        assert.dom('[data-module="user-management"] input').hasAttribute('type', 'text');
        assert.dom('[data-module="user-management"] input').hasAttribute('placeholder', 'Search User ..');
    });
});

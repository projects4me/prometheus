import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | role/card', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        let role = {
            name: "admin",
            description: "this is the admin role",
            dateCreated: "2016-09-21 01:15:32"
        }

        this.set('role', role);

        await render(hbs`
            <Role::Card
                @role={{this.role}}
            />  
        `);

        assert.dom('[data-role-field="name"]').hasText('admin');
        assert.dom('[data-role-field="description"] h5').hasText('this is the admin role');
        assert.dom('[data-role-field="dateCreated"]').hasText('21st Sep, 2016');
    });
});

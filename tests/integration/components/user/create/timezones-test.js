import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | user/create/timezones', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        this.set('selectRelated', () => true);

        await render(hbs`
            <User::Create::Timezones
                @selectRelated={{this.selectRelated}}
            />
        `);

        assert.dom('[data-field="select-timezone"]').exists();
    });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | form-fields/field-switch', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        this.owner.register('service:acl', AclStub);
        this.set('testFunction', () => true);

        await render(hbs`
            <FormFields::FieldSwitch
                @callBack={{this.testFunction}}
            />
        `);

        assert.dom('input[type="checkbox"]').exists();
    });
});

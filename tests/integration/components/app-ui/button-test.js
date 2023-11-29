import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | app-ui/button', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        this.owner.register('service:acl', AclStub);
        
        await render(hbs`
            <AppUi::Button>
                template block text
            </AppUi::Button>
        `);

        assert.dom(this.element).hasText('template block text');
    });
});

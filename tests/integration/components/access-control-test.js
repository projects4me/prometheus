import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../stub-services/acl-stub';
import Service from '@ember/service';

class AclStub2 extends Service {
    checkAccess() {
        return false;
    }
}

module('Integration | Component | access-control', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders the markup inside the component', async function (assert) {
        this.owner.register('service:acl', AclStub);

        await render(hbs`
            <AccessControl>
                Rendered Markup
            </AccessControl>
        `);

        assert.dom(this.element).hasText('Rendered Markup');
    });

    test('it will not render the markup inside the component', async function (assert) {
        this.owner.register('service:acl', AclStub2);
 
        await render(hbs`
            <AccessControl @aclContext="Appp">
                Rendered Markup
            </AccessControl>
        `);

        assert.dom(this.element).hasText('');
    });
});

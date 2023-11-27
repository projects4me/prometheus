import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';

module('Integration | Component | user-management/account-status', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders component with user account status active', async function (assert) {
        this.owner.register('service:acl', AclStub);

        let user = {
            name: "Rana Nouman",
            accountStatus: "active"
        }

        this.set('user', user);
        this.set('testFunction', () => true);

        await render(hbs
            `<UserManagement::AccountStatus 
                @user={{this.user}}
                @changeUserStatus={{this.testFunction}}
            />`
            );

        assert.dom('input[type="checkbox"]').exists();
        assert.dom('input[type="checkbox"]').isChecked();
    });

    test('it renders component with user account status in-active', async function (assert) {
        this.owner.register('service:acl', AclStub);
        
        let user = {
            name: "Rana Nouman",
            accountStatus: "inactive"
        }

        this.set('user', user);
        this.set('testFunction', () => true);

        await render(hbs
            `<UserManagement::AccountStatus 
                @user={{this.user}}
                @changeUserStatus={{this.testFunction}}
            />`
            );

        assert.dom('input[type="checkbox"]').exists();
        assert.dom('input[type="checkbox"]').isNotChecked();
    });    
});

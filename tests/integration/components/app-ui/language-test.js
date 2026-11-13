import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import LanguageStub from '../../stub-services/language-stub';
import AclStub from '../../stub-services/acl-stub';
import { openSelect, optionsSelector } from 'prometheus/tests/helpers/select';

module('Integration | Component | app-ui/language', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        this.owner.register('service:language', LanguageStub);
        this.owner.register('service:acl', AclStub);
        this.set('onchange', () => true);

        await render(hbs`
            <AppUi::Language 
                @placeholder="Select language"
                @label="Languages"
                @onchange={{this.onchange}}
                @data-field="user.language"                
            />
        `);

        assert.dom('[data-field="select-language"]').exists();
        await openSelect('[data-field="select-language"]');
        assert.dom(optionsSelector()).exists({ count: 2 });
    });
});
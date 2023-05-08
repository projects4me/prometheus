import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import LanguageStub from '../../stub-services/language-stub';

module('Integration | Component | app-ui/language', function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
        this.owner.register('service:language', LanguageStub);
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
        await click('[data-field="select-language"] div.ember-basic-dropdown-trigger');
        assert.dom('li.ember-power-select-option').exists({ count: 2 });
    });
});
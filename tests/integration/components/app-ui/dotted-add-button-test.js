import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | app-ui/dotted-add-button', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders', async function (assert) {
		this.set('onClick', () => true);
		await render(hbs`
                <AppUi::DottedAddButton 
                    @onClick={{this.onClick}}
                    @data-add="module"
                />
            `);
		assert.dom('[data-add="module"]').exists();
        assert.dom('[data-add="module"] > div').hasClass('dotted-circle-add');
	});
});

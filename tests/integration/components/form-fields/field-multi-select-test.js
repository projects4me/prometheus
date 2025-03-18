import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../stub-services/acl-stub';

module(
	'Integration | Component | form-fields/field-multi-select',
	function (hooks) {
		setupRenderingTest(hooks);

		test('it renders', async function (assert) {
			this.owner.register('service:acl', AclStub);

			let options = [
                'Value1',
                'Value2',
                'Value3',
                'Value4'
			];
			let selectedOptions = [
                'Value3',
                'Value2'
			];

			this.set('onchange', () => true);
			this.set('availableOptions', options);
			this.set('selectedOptions', selectedOptions);

			await render(hbs`
                <FormFields::FieldMultiSelect
                    @onchange={{this.onchange}}
                    @options={{this.availableOptions}}
                    @selected={{this.selectedOptions}}
                />
            `);

            //checking selected options
            selectedOptions.forEach((option, i) => {
                assert.dom(`[data-multi-select-value='${option}']`).exists();
            });
		});    
	}
);

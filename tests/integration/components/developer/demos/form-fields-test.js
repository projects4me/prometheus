import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import AclStub from '../../../stub-services/acl-stub';
import { FIELDS } from 'prometheus/components/developer/demos/form-fields';

module('Integration | Component | developer/demos/form-fields', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.owner.register('service:acl', AclStub);
		this.set('entry', { label: 'Form fields', status: 'stable', summary: 's', usedIn: [], doc: null });
	});

	test('every field renders', async function (assert) {
		await render(hbs`<Developer::Demos::FormFields @entry={{this.entry}} />`);
		for (let field of FIELDS) {
			await click(`[data-state="${field}"]`);
			assert.dom(`[data-demo-field="${field}"] > *`).exists(`${field} renders`);
		}
	});

	test('text reports its value and the log', async function (assert) {
		await render(hbs`<Developer::Demos::FormFields @entry={{this.entry}} />`);
		await fillIn('[data-demo-field="FieldText"] input', 'hello');
		assert.dom('[data-demo-value]').hasText('hello');
		assert.dom('[data-event-log-row]').includesText('input');
	});

	test('switch reports its value', async function (assert) {
		await render(hbs`<Developer::Demos::FormFields @entry={{this.entry}} />`);
		await click('[data-state="FieldSwitch"]');
		await click('[data-input-type="switch"]');
		assert.dom('[data-demo-value]').hasText('true');
	});

	test('the validation error is shown', async function (assert) {
		await render(hbs`<Developer::Demos::FormFields @entry={{this.entry}} />`);
		assert.dom('[data-demo-validation]').doesNotExist();
		await click('[data-control="error"]');
		assert.dom('[data-demo-validation]').includesText('This field is invalid');
	});
});

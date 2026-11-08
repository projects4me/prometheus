import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/state-switch', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders default states and reports a change', async function (assert) {
		let picked;
		this.set('value', 'normal');
		this.set('onChange', (s) => (picked = s));
		await render(
			hbs`<Developer::StateSwitch @value={{this.value}} @onChange={{this.onChange}} />`
		);
		assert.dom('[data-state]').exists({ count: 4 });
		assert.dom('[data-state="normal"]').hasClass('active');
		await click('[data-state="error"]');
		assert.strictEqual(picked, 'error');
	});

	test('it renders custom states', async function (assert) {
		this.set('states', ['a', 'b']);
		this.set('onChange', () => {});
		await render(
			hbs`<Developer::StateSwitch @states={{this.states}} @value="b" @onChange={{this.onChange}} />`
		);
		assert.dom('[data-state]').exists({ count: 2 });
		assert.dom('[data-state="b"]').hasClass('active');
	});
});

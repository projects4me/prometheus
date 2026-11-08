import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | quick-list/selection', function (hooks) {
	setupRenderingTest(hooks);

	test('select-all shows the icon for each state', async function (assert) {
		this.set('state', 'none');
		await render(hbs`<QuickList::SelectAll @state={{this.state}} @onToggle={{this.noop}} />`);
		assert.dom('[data-quick-list-select-all] i').hasClass('fa-square-o');
		this.set('state', 'some');
		assert.dom('[data-quick-list-select-all] i').hasClass('fa-minus-square-o');
		this.set('state', 'all');
		assert.dom('[data-quick-list-select-all] i').hasClass('fa-check-square');
		assert.dom('[data-quick-list-select-all]').hasAttribute('aria-label');
	});

	test('select-all calls @onToggle', async function (assert) {
		let calls = 0;
		this.set('onToggle', () => calls++);
		await render(hbs`<QuickList::SelectAll @state="none" @onToggle={{this.onToggle}} />`);
		await click('[data-quick-list-select-all]');
		assert.strictEqual(calls, 1);
	});

	test('selection bar shows the count, yields actions and toggles all', async function (assert) {
		let toggled = 0;
		this.set('onToggleAll', () => toggled++);
		await render(hbs`
			<QuickList::SelectionBar @count={{3}} @state="some" @onToggleAll={{this.onToggleAll}} @onClear={{this.noop}}>
				<:actions><button type="button" data-test-action>Delete</button></:actions>
			</QuickList::SelectionBar>`);
		assert.dom('[data-quick-list-selection-count]').hasText('3 selected');
		assert.dom('[data-quick-list-selection-actions] [data-test-action]').exists();
		assert.dom('[data-quick-list-select-all] i').hasClass('fa-minus-square-o');
		await click('[data-quick-list-select-all]');
		assert.strictEqual(toggled, 1);
	});

	test('selection bar clears', async function (assert) {
		let cleared = 0;
		this.set('onClear', () => cleared++);
		await render(hbs`<QuickList::SelectionBar @count={{1}} @state="all" @onToggleAll={{this.noop}} @onClear={{this.onClear}} />`);
		await click('[data-quick-list-selection-clear]');
		assert.strictEqual(cleared, 1);
	});
});

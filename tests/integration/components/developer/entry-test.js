import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | developer/entry', function (hooks) {
	setupRenderingTest(hooks);

	test('it renders the blocks and yields the logger', async function (assert) {
		await render(hbs`
			<Developer::Entry>
				<:demo as |log|><button type="button" data-fire {{on "click" (fn log.log "fired")}}>Fire</button></:demo>
				<:controls>Ctrl</:controls>
				<:docs>Docs</:docs>
			</Developer::Entry>`);
		assert.dom('.col-md-7 [data-entry-demo] [data-fire]').exists();
		assert.dom('.col-md-5 [data-entry-controls]').includesText('Ctrl');
		assert.dom('[data-entry-docs]').hasText('Docs');
		await click('[data-fire]');
		assert.dom('[data-event-log-row]').includesText('fired');
	});

	test('Reset calls onReset', async function (assert) {
		let called = 0;
		this.set('onReset', () => called++);
		await render(
			hbs`<Developer::Entry @onReset={{this.onReset}}><:demo>d</:demo></Developer::Entry>`
		);
		await click('[data-entry-reset]');
		assert.strictEqual(called, 1);
		assert.dom('[data-entry-docs]').doesNotExist();
	});
});

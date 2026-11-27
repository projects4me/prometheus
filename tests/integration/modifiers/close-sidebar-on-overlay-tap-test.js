import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | close-sidebar-on-overlay-tap', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.closed = 0;
		this.sidebar = { close: () => this.closed++ };
	});

	test('a tap on the page closes the sidebar', async function (assert) {
		await render(hbs`<div data-test-page {{close-sidebar-on-overlay-tap this.sidebar}}><span data-test-inside></span></div>`);
		await click('[data-test-inside]');
		assert.strictEqual(this.closed, 1);
	});

	test('it removes the listener on teardown', async function (assert) {
		this.show = true;
		await render(hbs`{{#if this.show}}<div data-test-page {{close-sidebar-on-overlay-tap this.sidebar}}></div>{{/if}}<button type="button" data-test-outside></button>`);
		let page = this.element.querySelector('[data-test-page]');
		this.set('show', false);
		page.click();
		assert.strictEqual(this.closed, 0);
	});
});

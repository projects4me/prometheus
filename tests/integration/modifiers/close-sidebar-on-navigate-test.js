import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Evented from '@ember/object/evented';
import EmberObject from '@ember/object';

class FakeRouter extends EmberObject.extend(Evented) {}

module('Integration | Modifier | close-sidebar-on-navigate', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.router = FakeRouter.create();
		this.closed = 0;
		this.sidebar = { close: () => this.closed++ };
	});

	test('it closes the sidebar on route change', async function (assert) {
		await render(hbs`<div {{close-sidebar-on-navigate this.router this.sidebar}}></div>`);
		this.router.trigger('routeDidChange');
		assert.strictEqual(this.closed, 1);
	});

	test('it removes the listener on teardown', async function (assert) {
		await render(hbs`<div {{close-sidebar-on-navigate this.router this.sidebar}}></div>`);
		await render(hbs``);
		this.router.trigger('routeDidChange');
		assert.strictEqual(this.closed, 0);
	});
});

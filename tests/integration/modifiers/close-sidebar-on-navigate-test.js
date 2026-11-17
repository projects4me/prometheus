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
		this.originalWidth = window.innerWidth;
		document.body.classList.add('sidebar-open');
	});

	hooks.afterEach(function () {
		document.body.classList.remove('sidebar-open');
		Object.defineProperty(window, 'innerWidth', { value: this.originalWidth, configurable: true, writable: true });
	});

	const setWidth = (w) => Object.defineProperty(window, 'innerWidth', { value: w, configurable: true, writable: true });

	test('it closes the sidebar on route change on phones', async function (assert) {
		setWidth(500);
		await render(hbs`<div {{close-sidebar-on-navigate this.router}}></div>`);
		this.router.trigger('routeDidChange');
		assert.false(document.body.classList.contains('sidebar-open'));
	});

	test('it leaves the sidebar alone on desktop', async function (assert) {
		setWidth(1200);
		await render(hbs`<div {{close-sidebar-on-navigate this.router}}></div>`);
		this.router.trigger('routeDidChange');
		assert.true(document.body.classList.contains('sidebar-open'));
	});

	test('it removes the listener on teardown', async function (assert) {
		setWidth(500);
		await render(hbs`<div {{close-sidebar-on-navigate this.router}}></div>`);
		await render(hbs``);
		this.router.trigger('routeDidChange');
		assert.true(document.body.classList.contains('sidebar-open'));
	});
});

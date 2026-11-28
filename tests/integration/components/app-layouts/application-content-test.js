/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | app-layouts/application-content', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		let context = this;
		this.closed = 0;
		this.owner.register('service:sidebar', class extends Service {
			close = () => context.closed++;
		});
	});

	test('it renders the page in the content wrapper and a tap on it closes the sidebar', async function (assert) {
		await render(hbs`<AppLayouts::ApplicationContent><span data-test-inside>page</span></AppLayouts::ApplicationContent>`);
		assert.dom('.content-wrapper [data-test-inside]').hasText('page');

		await click('[data-test-inside]');
		assert.strictEqual(this.closed, 1);
	});

	test('the page stays clickable: the tap reaches its target and is not prevented', async function (assert) {
		let clicked = 0;
		let prevented = null;
		this.press = (event) => {
			clicked++;
			prevented = event.defaultPrevented;
		};
		await render(hbs`<AppLayouts::ApplicationContent><button type="button" data-test-button {{on "click" this.press}}></button></AppLayouts::ApplicationContent>`);
		await click('[data-test-button]');
		assert.strictEqual(clicked, 1);
		assert.false(prevented);
	});

	test('with the real service only an open phone sidebar is closed by a tap', async function (assert) {
		this.owner.unregister('service:sidebar');
		this.owner.register('service:viewport', class extends Service { isPhone = true; });
		let sidebar = this.owner.lookup('service:sidebar');
		await render(hbs`<AppLayouts::ApplicationContent />`);

		await click('[data-test-application-content]');
		assert.false(sidebar.open);

		sidebar.toggle();
		assert.true(sidebar.open);
		await click('[data-test-application-content]');
		assert.false(sidebar.open);
	});
});

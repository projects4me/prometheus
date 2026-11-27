/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Styles | slim-scroll', function (hooks) {
	setupRenderingTest(hooks);

	test('it scrolls the element natively at its own height', async function (assert) {
		await render(hbs`
			<div class="slim-scroll" data-test-scroll>
				<div class="tall-content">Slim scroll test</div>
			</div>
		`);

		let element = document.querySelector('[data-test-scroll]');
		element.style.height = '200px';
		element.querySelector('.tall-content').style.height = '1000px';
		let style = window.getComputedStyle(element);

		assert.strictEqual(style.overflowY, 'auto', 'scrolls vertically');
		assert.strictEqual(style.overflowX, 'hidden', 'never scrolls sideways');
		assert.strictEqual(element.clientHeight, 200, 'keeps the height the element sets');
		assert.true(element.scrollHeight > element.clientHeight, 'content overflows into the scroll area');
		assert.dom('.slimScrollDiv').doesNotExist('no slimscroll wrapper');
	});

	test('it defines a 3px bar size, or 5px with slim-scroll-wide', async function (assert) {
		await render(hbs`
			<div class="slim-scroll" data-test-default></div>
			<div class="slim-scroll slim-scroll-wide" data-test-wide></div>
		`);

		let size = (selector) =>
			window.getComputedStyle(document.querySelector(selector)).getPropertyValue('--slim-scroll-size').trim();

		assert.strictEqual(size('[data-test-default]'), '3px');
		assert.strictEqual(size('[data-test-wide]'), '5px');
	});
});

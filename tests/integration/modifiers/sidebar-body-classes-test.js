/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | sidebar-body-classes', function (hooks) {
	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		this.body = document.body.classList;
		this.setProperties({ show: true, collapsed: false, hoverExpanded: false, open: false });
	});

	hooks.afterEach(function () {
		this.body.remove('sidebar-collapse', 'sidebar-expanded-on-hover', 'sidebar-open');
	});

	const template = hbs`{{#if this.show}}<div {{sidebar-body-classes collapsed=this.collapsed hoverExpanded=this.hoverExpanded open=this.open}}></div>{{/if}}`;

	test('it follows the collapsed and hover state', async function (assert) {
		await render(template);
		assert.false(this.body.contains('sidebar-collapse'));

		this.set('collapsed', true);
		await settled();
		assert.true(this.body.contains('sidebar-collapse'));

		this.set('hoverExpanded', true);
		await settled();
		assert.false(this.body.contains('sidebar-collapse'), 'hover shows the collapsed sidebar expanded');
		assert.true(this.body.contains('sidebar-expanded-on-hover'));
	});

	test('it follows the phone open state', async function (assert) {
		await render(template);
		this.set('open', true);
		await settled();
		assert.true(this.body.contains('sidebar-open'));

		this.set('open', false);
		await settled();
		assert.false(this.body.contains('sidebar-open'));
	});

	test('it removes the classes when the element goes away', async function (assert) {
		this.setProperties({ collapsed: true, open: true });
		await render(template);

		this.set('show', false);
		await settled();
		assert.false(this.body.contains('sidebar-collapse'));
		assert.false(this.body.contains('sidebar-open'));
	});
});

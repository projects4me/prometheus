/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Service | sidebar-menu', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		let context = this;
		this.mini = false;
		this.owner.register('service:sidebar', class extends Service {
			get isMini() {
				return context.mini;
			}
		});
		this.menu = this.owner.lookup('service:sidebar-menu');
	});

	test('until a submenu is toggled the active item is open', function (assert) {
		assert.true(this.menu.isOpen('Project', true));
		assert.false(this.menu.isOpen('Issue', false));
	});

	test('one submenu is open at a time and a second toggle closes it', function (assert) {
		this.menu.toggle('Issue', false);
		assert.true(this.menu.isOpen('Issue', false));
		assert.false(this.menu.isOpen('Project', true), 'the active item closes once another is toggled');

		this.menu.toggle('Issue', false);
		assert.false(this.menu.isOpen('Issue', false));
	});

	test('toggling the active item first closes its submenu', function (assert) {
		this.menu.toggle('Project', true);
		assert.false(this.menu.isOpen('Project', true));
	});

	test('nothing changes while the sidebar is collapsed to its icon strip', function (assert) {
		this.mini = true;
		this.menu.toggle('Project', false);
		assert.false(this.menu.isOpen('Project', false));
	});
});

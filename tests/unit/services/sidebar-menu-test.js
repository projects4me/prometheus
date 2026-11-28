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
		this.owner.register('service:router', class extends Service {
			currentRouteName = 'app.project.page';
		});
		this.menu = this.owner.lookup('service:sidebar-menu');
	});

	test('until a submenu is toggled the active route item is open', function (assert) {
		assert.true(this.menu.isOpen('Project', 'app.project'));
		assert.false(this.menu.isOpen('Issue', 'app.issue'));
	});

	test('one submenu is open at a time and a second toggle closes it', function (assert) {
		this.menu.toggle('Issue', 'app.issue');
		assert.true(this.menu.isOpen('Issue', 'app.issue'));
		assert.false(this.menu.isOpen('Project', 'app.project'), 'the active item closes once another is toggled');

		this.menu.toggle('Issue', 'app.issue');
		assert.false(this.menu.isOpen('Issue', 'app.issue'));
	});

	test('toggling the active item first closes its submenu', function (assert) {
		this.menu.toggle('Project', 'app.project');
		assert.false(this.menu.isOpen('Project', 'app.project'));
	});

	test('nothing changes while the sidebar is collapsed to its icon strip', function (assert) {
		this.mini = true;
		this.menu.toggle('Issue', 'app.issue');
		assert.false(this.menu.isOpen('Issue', 'app.issue'));
	});
});

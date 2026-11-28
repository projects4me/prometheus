/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { SIDEBAR_STORAGE_KEY } from 'prometheus/services/sidebar-preference';

module('Unit | Service | sidebar-preference', function (hooks) {
	setupTest(hooks);

	test('it writes and reads the collapsed preference', function (assert) {
		let items = {};
		let preference = this.owner.lookup('service:sidebar-preference');
		preference.storage = {
			getItem: (key) => items[key] ?? null,
			setItem: (key, value) => {
				items[key] = value;
			}
		};

		assert.false(preference.read());
		preference.write(true);
		assert.strictEqual(items[SIDEBAR_STORAGE_KEY], 'true');
		assert.true(preference.read());
	});

	test('storage that throws means expanded and keeps nothing', function (assert) {
		let preference = this.owner.lookup('service:sidebar-preference');
		preference.storage = {
			getItem() {
				throw new Error('denied');
			},
			setItem() {
				throw new Error('full');
			}
		};

		assert.false(preference.read());
		preference.write(true);
		assert.false(preference.read());
	});
});

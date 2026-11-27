/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import { SIDEBAR_STORAGE_KEY } from 'prometheus/services/sidebar';

module('Unit | Service | sidebar', function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
        this.stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        localStorage.removeItem(SIDEBAR_STORAGE_KEY);
        this.phone = (isPhone) => this.owner.register('service:viewport', class extends Service { isPhone = isPhone; });
        this.body = document.body.classList;
    });

    hooks.afterEach(function () {
        if (this.stored === null) {
            localStorage.removeItem(SIDEBAR_STORAGE_KEY);
        } else {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, this.stored);
        }
        this.body.remove('sidebar-collapse', 'sidebar-open', 'sidebar-expanded-on-hover');
    });

    test('it restores the persisted collapsed state on the body', function (assert) {
        this.phone(false);
        localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true');
        let sidebar = this.owner.lookup('service:sidebar');

        assert.true(sidebar.collapsed);
        assert.true(this.body.contains('sidebar-collapse'));
    });

    test('on desktop the toggle collapses and expands, and persists the choice', function (assert) {
        this.phone(false);
        let sidebar = this.owner.lookup('service:sidebar');
        assert.false(this.body.contains('sidebar-collapse'));

        sidebar.toggle();
        assert.true(this.body.contains('sidebar-collapse'));
        assert.strictEqual(localStorage.getItem(SIDEBAR_STORAGE_KEY), 'true');

        sidebar.toggle();
        assert.false(this.body.contains('sidebar-collapse'));
        assert.strictEqual(localStorage.getItem(SIDEBAR_STORAGE_KEY), 'false');
        assert.false(this.body.contains('sidebar-open'), 'the phone class is never set on desktop');
    });

    test('on phones the toggle opens and closes without touching the desktop preference', function (assert) {
        this.phone(true);
        let sidebar = this.owner.lookup('service:sidebar');

        sidebar.toggle();
        assert.true(this.body.contains('sidebar-open'));
        sidebar.toggle();
        assert.false(this.body.contains('sidebar-open'));
        assert.strictEqual(localStorage.getItem(SIDEBAR_STORAGE_KEY), null);
    });

    test('close shuts the phone sidebar and leaves the collapsed state alone', function (assert) {
        this.phone(true);
        localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true');
        let sidebar = this.owner.lookup('service:sidebar');
        sidebar.toggle();

        sidebar.close();
        assert.false(this.body.contains('sidebar-open'));
        assert.true(sidebar.collapsed);
        assert.true(this.body.contains('sidebar-collapse'));
    });

    test('hovering the collapsed sidebar expands it until the pointer leaves', function (assert) {
        this.phone(false);
        localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true');
        let sidebar = this.owner.lookup('service:sidebar');

        sidebar.hoverStart();
        assert.false(this.body.contains('sidebar-collapse'));
        assert.true(this.body.contains('sidebar-expanded-on-hover'));
        assert.false(sidebar.isMini);

        sidebar.hoverEnd();
        assert.true(this.body.contains('sidebar-collapse'));
        assert.false(this.body.contains('sidebar-expanded-on-hover'));
        assert.strictEqual(localStorage.getItem(SIDEBAR_STORAGE_KEY), 'true', 'hover never changes the preference');
    });

    test('hovering an expanded sidebar does nothing', function (assert) {
        this.phone(false);
        let sidebar = this.owner.lookup('service:sidebar');

        sidebar.hoverStart();
        assert.false(this.body.contains('sidebar-expanded-on-hover'));
    });
});

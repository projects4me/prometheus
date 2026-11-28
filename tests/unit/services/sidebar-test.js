/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

module('Unit | Service | sidebar', function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
        let context = this;
        this.saved = undefined;
        this.stored = false;
        this.owner.register('service:sidebar-preference', class extends Service {
            read() { return context.stored; }
            write(collapsed) { context.saved = collapsed; }
        });
        this.owner.register('service:viewport', class extends Service { @tracked isPhone = false; });
        this.viewport = this.owner.lookup('service:viewport');
        this.phone = (isPhone) => { this.viewport.isPhone = isPhone; };
    });

    test('it restores the persisted collapsed state', function (assert) {
        this.stored = true;
        let sidebar = this.owner.lookup('service:sidebar');

        assert.true(sidebar.collapsed);
        assert.true(sidebar.isMini);
    });

    test('on desktop the toggle collapses and expands, and persists the choice', function (assert) {
        let sidebar = this.owner.lookup('service:sidebar');
        assert.false(sidebar.collapsed);

        sidebar.toggle();
        assert.true(sidebar.collapsed);
        assert.true(this.saved);

        sidebar.toggle();
        assert.false(sidebar.collapsed);
        assert.false(this.saved);
        assert.false(sidebar.isPhoneOpen, 'the phone sidebar is never opened on desktop');
    });

    test('on phones the toggle opens and closes without touching the desktop preference', function (assert) {
        this.phone(true);
        let sidebar = this.owner.lookup('service:sidebar');

        sidebar.toggle();
        assert.true(sidebar.isPhoneOpen);
        sidebar.toggle();
        assert.false(sidebar.isPhoneOpen);
        assert.strictEqual(this.saved, undefined);
    });

    test('close shuts the phone sidebar and leaves the collapsed state alone', function (assert) {
        this.phone(true);
        this.stored = true;
        let sidebar = this.owner.lookup('service:sidebar');
        sidebar.toggle();

        sidebar.close();
        assert.false(sidebar.isPhoneOpen);
        assert.true(sidebar.collapsed);
    });

    test('hovering the collapsed sidebar expands it until the pointer leaves', function (assert) {
        this.stored = true;
        let sidebar = this.owner.lookup('service:sidebar');

        sidebar.hoverStart();
        assert.true(sidebar.isExpandedOnHover);
        assert.false(sidebar.isMini);

        sidebar.hoverEnd();
        assert.false(sidebar.isExpandedOnHover);
        assert.true(sidebar.isMini);
        assert.strictEqual(this.saved, undefined, 'hover never changes the preference');
    });

    test('hovering an expanded sidebar does nothing', function (assert) {
        let sidebar = this.owner.lookup('service:sidebar');

        sidebar.hoverStart();
        assert.false(sidebar.isExpandedOnHover);
    });

    test('the toggle while hover expands the collapsed sidebar keeps it expanded', function (assert) {
        this.stored = true;
        let sidebar = this.owner.lookup('service:sidebar');
        sidebar.hoverStart();

        sidebar.toggle();
        assert.false(sidebar.collapsed);
        assert.false(sidebar.isExpandedOnHover);
        assert.false(sidebar.isMini);
        assert.false(this.saved);
    });

    test('an open phone sidebar does not show open once the window is desktop wide', function (assert) {
        this.phone(true);
        let sidebar = this.owner.lookup('service:sidebar');
        sidebar.toggle();

        this.phone(false);
        assert.false(sidebar.isPhoneOpen);

        sidebar.toggle();
        assert.false(sidebar.open, 'a desktop toggle drops the hidden phone state');

        this.phone(true);
        assert.false(sidebar.isPhoneOpen, 'back on a phone the sidebar stays closed');
    });

    test('hover expansion does not show on a phone, and leaving the sidebar there still ends it', function (assert) {
        this.stored = true;
        let sidebar = this.owner.lookup('service:sidebar');
        sidebar.hoverStart();

        this.phone(true);
        assert.false(sidebar.isExpandedOnHover);

        sidebar.hoverEnd();
        this.phone(false);
        assert.false(sidebar.isExpandedOnHover);
        assert.true(sidebar.isMini);
    });
});

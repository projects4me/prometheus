/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Service | settings-navigation', function (hooks) {
    setupTest(hooks);

    const stubAcl = (denied) => class extends Service {
        checkAccess(context) { return !denied.includes(context); }
    };

    test('groups and firstRoute follow the user permissions', function (assert) {
        this.owner.register('service:acl', stubAcl(['user.read']));
        let service = this.owner.lookup('service:settings-navigation');

        assert.deepEqual(service.groups[0].items.map(item => item.key), ['roles']);
        assert.equal(service.firstRoute, 'app.role');
    });

    test('a user who can see nothing has no groups and no first route', function (assert) {
        this.owner.register('service:acl', stubAcl(['user.read', 'role.read']));
        let service = this.owner.lookup('service:settings-navigation');

        assert.deepEqual(service.groups, []);
        assert.strictEqual(service.firstRoute, null);
    });
});

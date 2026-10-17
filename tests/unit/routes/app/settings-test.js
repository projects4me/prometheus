/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Route | app/settings', function (hooks) {
    setupTest(hooks);

    const stubAcl = (denied) => class extends Service {
        checkAccess(context) { return !denied.includes(context); }
    };

    test('model lists the settings pages the user may access', function (assert) {
        this.owner.register('service:acl', stubAcl(['role.read']));
        let route = this.owner.lookup('route:app/settings');

        let groups = route.model();

        assert.deepEqual(groups.map(group => group.key), ['access']);
        assert.deepEqual(groups[0].items.map(item => item.name), ['Users']);
    });

    test('model drops groups left without pages', function (assert) {
        this.owner.register('service:acl', stubAcl(['user.read', 'role.read']));
        let route = this.owner.lookup('route:app/settings');

        assert.deepEqual(route.model(), []);
    });
});

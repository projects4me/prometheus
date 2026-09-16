/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';

module('Unit | Service | acl', function (hooks) {
    setupTest(hooks);

    test('checkAccess allows project.get with allowed 1 (all) and 2 (members)', function (assert) {
        let service = this.owner.lookup('service:acl');
        let currentUser = this.owner.lookup('service:current-user');

        currentUser.set('user', EmberObject.create({
            aclPermissions: [
                EmberObject.create({ entity: 'project.get', allowed: '1' })
            ]
        }));
        assert.true(service.checkAccess('project.read'), 'all (1) allows project.read');

        currentUser.set('user', EmberObject.create({
            aclPermissions: [
                EmberObject.create({ entity: 'project.get', allowed: '2' })
            ]
        }));
        assert.true(service.checkAccess('project.read'), 'members (2) allows project.read');

        currentUser.set('user', EmberObject.create({
            aclPermissions: [
                EmberObject.create({ entity: 'project.get', allowed: '0' })
            ]
        }));
        assert.false(service.checkAccess('project.read'), 'none (0) denies project.read');
    });
});

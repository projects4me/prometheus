/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import {
    isActionAllowed, toCoverageEntries, coverageByRole, membersByRole, accessTier, roleInitials, accessSplit
} from 'prometheus/utils/role/access';
import { buildRoleListRequest, buildUserrolesRequest } from 'prometheus/utils/role/browser-requests';
import { browserValues } from 'prometheus/utils/role/browser-defaults';

module('Unit | Utility | role/access', function () {
    test('isActionAllowed treats empty as the permissive default and 0 as a deny', function (assert) {
        assert.true(isActionAllowed(''));
        assert.true(isActionAllowed(undefined));
        assert.true(isActionAllowed('1'));
        assert.true(isActionAllowed('2'));
        assert.false(isActionAllowed('0'));
        assert.false(isActionAllowed(0));
    });

    test('coverageByRole counts only the action permissions of each role', function (assert) {
        let entries = [
            ...toCoverageEntries(1, [
                { resourceName: 'issue.get', allowed: '1' },
                { resourceName: 'issue.create', allowed: '0' },
                { resourceName: 'issue.subject', allowed: '0' },
                { resourceName: '', allowed: '1' }
            ]),
            ...toCoverageEntries(2, [{ resourceName: 'issue.get', allowed: '' }])
        ];
        assert.deepEqual(coverageByRole(entries), { 1: 50, 2: 100 });
    });

    test('membersByRole groups plain users by role and skips unlinked assignments', function (assert) {
        let members = membersByRole([
            { roleId: '1', user: { id: '7', name: 'Ann' } },
            { roleId: '1', user: { id: '8', name: 'Bob' } },
            { roleId: '2', user: null },
            { roleId: '', user: { id: '9', name: 'Cid' } }
        ]);
        assert.deepEqual(members, { 1: [{ id: '7', name: 'Ann' }, { id: '8', name: 'Bob' }] });
    });

    test('accessTier and accessSplit follow the card tiers', function (assert) {
        assert.strictEqual(accessTier(null), 'none');
        assert.strictEqual(accessTier(80), 'high');
        assert.strictEqual(accessTier(50), 'elevated');
        assert.strictEqual(accessTier(25), 'medium');
        assert.strictEqual(accessTier(10), 'low');
        assert.deepEqual(accessSplit(70), { known: true, granted: 70, denied: 30 });
        assert.deepEqual(accessSplit(undefined), { known: false, granted: 0, denied: 0 });
    });

    test('roleInitials takes the first letters of the first two words', function (assert) {
        assert.strictEqual(roleInitials('ground control team'), 'GC');
        assert.strictEqual(roleInitials('  Admin '), 'A');
        assert.strictEqual(roleInitials(undefined), '');
    });

    test('the role browser requests carry the params and the listed role ids', function (assert) {
        assert.deepEqual(buildRoleListRequest(browserValues({})), { sort: 'Role.name', order: 'ASC', page: 1 });
        assert.deepEqual(
            buildRoleListRequest(browserValues({ query: '(Role.name CONTAINS a)', page: '2', sort: 'Role.dateModified', order: 'DESC', group: 'tier' })),
            { sort: 'Role.dateModified', order: 'DESC', page: 2, query: '((Role.name CONTAINS a))' }
        );
        assert.strictEqual(buildUserrolesRequest([]), null);
        assert.deepEqual(buildUserrolesRequest(['1', '2']), {
            query: '((Userrole.roleId : 1) OR (Userrole.roleId : 2))',
            rels: 'user',
            limit: -1
        });
    });
});

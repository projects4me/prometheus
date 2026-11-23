/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { relsForQuery } from 'prometheus/utils/query/rels';
import { issueQuerySchema } from '../../../helpers/query-schema';

module('Unit | Utility | query | rels', function () {
    const schema = issueQuerySchema();

    test('each relation field gives its relation', function (assert) {
        assert.strictEqual(relsForQuery(schema, "(issuemilestone.name : 'v1')"), 'issuemilestone');
        assert.strictEqual(relsForQuery(schema, "(issuetype.name : 'Bug')"), 'issuetype');
        assert.strictEqual(relsForQuery(schema, "(assignedTo.name : 'Ann')"), 'assignedTo');
    });

    test('plain Issue fields give no relation', function (assert) {
        assert.strictEqual(relsForQuery(schema, "(Issue.status : 'new') AND (Issue.id !: 1)"), '');
    });

    test('always is merged in without duplicates', function (assert) {
        assert.strictEqual(relsForQuery(schema, "(assignedTo.name : 'Ann') AND (issuemilestone.name : 'v1')", ['assignedTo', 'project']), 'assignedTo,project,issuemilestone');
    });

    test('a relation name inside a quoted value is not a filter', function (assert) {
        assert.strictEqual(relsForQuery(schema, "(Issue.subject CONTAINS 'issuemilestone.name')"), '');
    });
});

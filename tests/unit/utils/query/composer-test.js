/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { condition, group } from 'prometheus/utils/query/ast';
import { compose } from 'prometheus/utils/query/composer';
import { serialize } from 'prometheus/utils/query/serializer';

module('Unit | Utility | query | composer', function () {
    test('it ANDs the base and the user tree', function (assert) {
        let base = group('AND', [condition('Issue.projectId', ':', 'p1'), condition('Issue.milestoneId', ':', 'm1')]);
        let user = group('OR', [condition('Issue.priority', ':', 'High'), condition('Issue.priority', ':', 'Highest')]);
        let composed = compose(base, user);

        assert.strictEqual(composed.conjunction, 'AND');
        assert.strictEqual(
            serialize(composed).query,
            '((Issue.projectId : p1) AND (Issue.milestoneId : m1) AND ((Issue.priority : High) OR (Issue.priority : Highest)))',
            'the AND base merges into the result'
        );
        assert.strictEqual(base.children.length, 2, 'the inputs are untouched');
    });

    test('a missing or empty side leaves the other', function (assert) {
        let base = group('AND', [condition('Issue.projectId', ':', 'p1')]);

        assert.strictEqual(serialize(compose(base, group('AND', []))).query, '((Issue.projectId : p1))');
        assert.strictEqual(serialize(compose(null, base)).query, '((Issue.projectId : p1))');
        assert.strictEqual(compose(null, undefined).children.length, 0);
    });
});

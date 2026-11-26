/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { module, test } from 'qunit';
import { issueLinkGroups } from 'prometheus/utils/gantt/issue-links';

module('Unit | Utility | gantt/issue-links', function () {
  const issue = { id: '1', parentId: '9' };
  const parent = { id: '9' };
  const child = { id: '5', parentId: '1' };
  const blocker = { id: '2' };
  const related = { id: '3' };

  function link(source, target) {
    let sides = { sourceIssue: source, targetIssue: target };
    return {
      belongsTo: (side) => ({
        id: () => sides[side].id,
        value: () => sides[side],
      }),
    };
  }

  function lookup(links = {}) {
    let empty = () => [];
    return {
      blockedBy: links.blockedBy ?? empty,
      blocks: links.blocks ?? empty,
      splitFrom: links.splitFrom ?? empty,
      splitInto: links.splitInto ?? empty,
      relates: links.relates ?? empty,
    };
  }

  test('no issue has no groups', function (assert) {
    assert.deepEqual(issueLinkGroups(null, lookup(), []), []);
  });

  test('groups only the relations that have issues, in display order', function (assert) {
    let groups = issueLinkGroups(
      issue,
      lookup({
        blockedBy: () => [link(blocker, issue)],
        relates: () => [link(issue, related)],
      }),
      [issue, parent, child],
    );

    assert.deepEqual(
      groups.map((group) => group.key),
      ['blockedBy', 'relates', 'parent', 'children'],
    );
    assert.deepEqual(groups[0], {
      key: 'blockedBy',
      withStatus: true,
      issues: [blocker],
    });
    assert.deepEqual(
      groups[1].issues,
      [related],
      'relates takes the side that is not the issue',
    );
    assert.deepEqual(groups[2].issues, [parent]);
    assert.deepEqual(groups[3].issues, [child]);
  });

  test('a relates link where the issue is the target names the source', function (assert) {
    let groups = issueLinkGroups(
      issue,
      lookup({ relates: () => [link(related, issue)] }),
      [],
    );
    assert.deepEqual(groups[0].issues, [related]);
  });

  test('a parent outside the chart is left out, and no lookup still finds children', function (assert) {
    let groups = issueLinkGroups(issue, null, [issue, child]);
    assert.deepEqual(
      groups.map((group) => group.key),
      ['children'],
    );
  });
});

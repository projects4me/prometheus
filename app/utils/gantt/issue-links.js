/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The link groups in the order they show: the lookup method that finds the links, the side of the link the other
 * issue is on (null when it depends on the issue, as for `relates`) and whether rows show the other issue's status.
 *
 * @property LINK_GROUPS
 * @type Array
 */
const LINK_GROUPS = [
  { key: 'blockedBy', other: 'sourceIssue', withStatus: true },
  { key: 'blocks', other: 'targetIssue' },
  { key: 'splitFrom', other: 'sourceIssue' },
  { key: 'splitInto', other: 'targetIssue' },
  { key: 'relates', other: null },
];

/**
 * The side of a link the other issue is on.
 *
 * @method otherSide
 * @param {Issuelink} link
 * @param {Issue} issue
 * @return {String} 'sourceIssue' or 'targetIssue'
 * @private
 */
function otherSide(link, issue) {
  return String(link.belongsTo('sourceIssue').id()) === String(issue.id)
    ? 'targetIssue'
    : 'sourceIssue';
}

/**
 * The groups from the links lookup, each with the other issues of its links.
 *
 * @method lookupGroups
 * @param {Issue} issue
 * @param {IssueLinkLookup} lookup
 * @return {Array} `{ key, withStatus, issues }`
 * @private
 */
function lookupGroups(issue, lookup) {
  if (!lookup || issue.id === undefined || issue.id === null) {
    return [];
  }
  return LINK_GROUPS.map(({ key, other, withStatus }) => ({
    key,
    withStatus: Boolean(withStatus),
    issues: lookup[key](issue.id)
      .map((link) => link.belongsTo(other ?? otherSide(link, issue)).value())
      .filter(Boolean),
  }));
}

/**
 * An issue's linked issues by relation, in display order: blocked by, blocks, split from/into and relates from the
 * links lookup, then the parent and children from the chart's issues. Groups without issues are left out.
 *
 * @method issueLinkGroups
 * @param {Issue} issue
 * @param {IssueLinkLookup} lookup The chart's links lookup, or null.
 * @param {Array} issues The chart's issues, for the parent and children.
 * @return {Array} `{ key, withStatus, issues }`
 */
export function issueLinkGroups(issue, lookup, issues = []) {
  if (!issue) {
    return [];
  }
  let all = issues || [];
  let parent = issue.parentId
    ? all.find((item) => item && String(item.id) === String(issue.parentId))
    : null;
  let children =
    issue.id === undefined || issue.id === null
      ? []
      : all.filter(
          (item) => item && String(item.parentId) === String(issue.id),
        );

  return [
    ...lookupGroups(issue, lookup),
    { key: 'parent', withStatus: false, issues: parent ? [parent] : [] },
    { key: 'children', withStatus: false, issues: children },
  ].filter((group) => group.issues.length);
}

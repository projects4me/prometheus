/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * A typed link between two issues of one workspace: the source issue `blocks`, `relates` to or `splits` into the
 * target issue. Parent/child is not a link, it stays on `Issue.parentId`.
 *
 * @class IssuelinkModel
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class IssuelinkModel extends Model {
	/**
	 * Date on which the link was created
	 *
	 * @property dateCreated
	 * @type String
	 * @for Issuelink
	 * @public
	 */
	@attr('string') dateCreated;

	/**
	 * Date on which the link was last modified
	 *
	 * @property dateModified
	 * @type String
	 * @for Issuelink
	 * @public
	 */
	@attr('string') dateModified;

	/**
	 * The identifier of the user who created the link
	 *
	 * @property createdUser
	 * @type String
	 * @for Issuelink
	 * @public
	 */
	@attr('string') createdUser;

	/**
	 * The identifier of the user who last modified the link
	 *
	 * @property modifiedUser
	 * @type String
	 * @for Issuelink
	 * @public
	 */
	@attr('string') modifiedUser;

	/**
	 * The kind of link: `blocks`, `relates` or `splits`
	 *
	 * @property type
	 * @type String
	 * @for Issuelink
	 * @public
	 */
	@attr('string') type;

	/**
	 * The identifier of the issue the link starts from (the blocker, the issue that is split)
	 *
	 * @property sourceIssueId
	 * @type String
	 * @for Issuelink
	 * @public
	 */
	@attr('string') sourceIssueId;

	/**
	 * The identifier of the issue the link points to (the blocked issue, the split-off issue)
	 *
	 * @property targetIssueId
	 * @type String
	 * @for Issuelink
	 * @public
	 */
	@attr('string') targetIssueId;

	/**
	 * The identifier of the project of the source issue
	 *
	 * @property projectId
	 * @type String
	 * @for Issuelink
	 * @public
	 */
	@attr('string') projectId;

	/**
	 * The identifier of the project of the target issue
	 *
	 * @property targetProjectId
	 * @type String
	 * @for Issuelink
	 * @public
	 */
	@attr('string') targetProjectId;

	/**
	 * The issue the link starts from
	 *
	 * @property sourceIssue
	 * @type Issue
	 * @for Issuelink
	 * @public
	 */
	@belongsTo('issue', { async: true, inverse: null }) sourceIssue;

	/**
	 * The issue the link points to
	 *
	 * @property targetIssue
	 * @type Issue
	 * @for Issuelink
	 * @public
	 */
	@belongsTo('issue', { async: true, inverse: null }) targetIssue;
}

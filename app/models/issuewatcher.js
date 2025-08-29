/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from '@ember-data/model';

/**
 * Model for issue watchers
 *
 * @class IssueWatcherModel
 * @namespace Prometheus.Models
 * @extends Model
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class IssuewatcherModel extends Model {
	/**
	 * Date on which the issue watcher was created
	 *
	 * @property dateCreated
	 * @type String
	 * @for IssueWatcher
	 * @public
	 */
	@attr('string') dateCreated;

	/**
	 * Date on which the issue watcher was last modified
	 *
	 * @property dateModified
	 * @type String
	 * @for IssueWatcher
	 * @public
	 */
	@attr('string') dateModified;

	/**
	 * The identifier of the user who created the issue watcher
	 *
	 * @property createdUser
	 * @type String
	 * @for IssueWatcher
	 * @public
	 */
	@attr('string') createdUser;

	/**
	 * The name of the user who created the issue watcher
	 *
	 * @property createdUserName
	 * @type String
	 * @for IssueWatcher
	 * @public
	 */
	@attr('string') createdUserName;

	/**
	 * The identifier of the user who last modified the issue watcher
	 *
	 * @property modifiedUser
	 * @type String
	 * @for IssueWatcher
	 * @public
	 */
	@attr('string') modifiedUser;

	/**
	 * The name of the user who last modified the issue watcher
	 *
	 * @property modifiedUserName
	 * @type String
	 * @for IssueWatcher
	 * @public
	 */
	@attr('string') modifiedUserName;

	/**
	 * The flag to check if the user is watching the issue
	 *
	 * @property isWatcher
	 * @type Boolean
	 * @for IssueWatcher
	 * @public
	 */
	@attr('bool') isWatching;

	/**
	 * The identifier of the issue being watched
	 *
	 * @property issueId
	 * @type String
	 * @for IssueWatcher
	 * @public
	 */
	@attr('string') issueId;

	/**
	 * The identifier of the user who is watching the issue
	 *
	 * @property userId
	 * @type String
	 * @for IssueWatcher
	 * @public
	 */
	@attr('string') userId;
}

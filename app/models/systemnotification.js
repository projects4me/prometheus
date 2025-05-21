/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, hasMany } from '@ember-data/model';

/**
 * Model for system notifications
 *
 * @class SystemnotificationModel
 * @namespace Prometheus.Models
 * @extends Model
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class SystemnotificationModel extends Model {
	/**
	 * Date on which the notification was created
	 *
	 * @property dateCreated
	 * @type String
	 * @for Systemnotification
	 * @public
	 */
	@attr('string') dateCreated;

	/**
	 * Date on which the notification was last modified
	 *
	 * @property dateModified
	 * @type String
	 * @for Systemnotification
	 * @public
	 */
	@attr('string') dateModified;

	/**
	 * Soft deletion flag
	 *
	 * @property deleted
	 * @type String
	 * @for Systemnotification
	 * @public
	 */
	@attr('string') deleted;

	/**
	 * Title of the notification
	 *
	 * @property title
	 * @type String
	 * @for Systemnotification
	 * @public
	 */
	@attr('string') title;

	/**
	 * Description of the notification
	 *
	 * @property description
	 * @type String
	 * @for Systemnotification
	 * @public
	 */
	@attr('string') description;

	/**
	 * The identifier of the user who created the notification
	 *
	 * @property createdUser
	 * @type String
	 * @for Systemnotification
	 * @public
	 */
	@attr('string') createdUser;

	/**
	 * The name of the user who created the notification
	 *
	 * @property createdUserName
	 * @type String
	 * @for Systemnotification
	 * @public
	 */
	@attr('string') createdUserName;

	/**
	 * The identifier of the user who last modified the notification
	 *
	 * @property modifiedUser
	 * @type String
	 * @for Systemnotification
	 * @public
	 */
	@attr('string') modifiedUser;

	/**
	 * The context of the notification
	 *
	 * @property context
	 * @type Json
	 * @for Systemnotification
	 * @public
	 */
	@attr('json') context;

	/**
	 * The name of the user who last modified the notification
	 *
	 * @property modifiedUserName
	 * @type String
	 * @for Systemnotification
	 * @public
	 */
	@attr('string') modifiedUserName;

	/**
	 * The recipients of the notification
	 *
	 * @property recipientRecords
	 * @type SystemnotificationrecipientModel
	 * @for Systemnotification
	 * @public
	 */
	@hasMany('systemnotificationrecipient') recipientRecords;
}

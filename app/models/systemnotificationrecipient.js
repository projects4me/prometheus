/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * Model for system notification recipients
 *
 * @class SystemnotificationrecipientModel
 * @namespace Prometheus.Models
 * @extends Model
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class SystemnotificationrecipientModel extends Model {
	/**
	 * The identifier of the notification
	 *
	 * @property systemNotificationId
	 * @type String
	 * @for Systemnotificationrecipient
	 * @public
	 */
	@attr('string') systemNotificationId;

	/**
	 * The identifier of the user who will receive the notification
	 *
	 * @property userId
	 * @type String
	 * @for Systemnotificationrecipient
	 * @public
	 */
	@attr('string') userId;

	/**
	 * Flag indicating whether the notification has been read
	 *
	 * @property isRead
	 * @type String
	 * @for Systemnotificationrecipient
	 * @public
	 */
	@attr('string') isRead;

	/**
	 * The identifier of the user who created the recipient record
	 *
	 * @property createdUser
	 * @type String
	 * @for Systemnotificationrecipient
	 * @public
	 */
	@attr('string') createdUser;

	/**
	 * The name of the user who created the recipient record
	 *
	 * @property createdUserName
	 * @type String
	 * @for Systemnotificationrecipient
	 * @public
	 */
	@attr('string') createdUserName;

	/**
	 * The identifier of the user who last modified the recipient record
	 *
	 * @property modifiedUser
	 * @type String
	 * @for Systemnotificationrecipient
	 * @public
	 */
	@attr('string') modifiedUser;

	/**
	 * The name of the user who last modified the recipient record
	 *
	 * @property modifiedUserName
	 * @type String
	 * @for Systemnotificationrecipient
	 * @public
	 */
	@attr('string') modifiedUserName;

	/**
	 * Date on which the recipient record was created
	 *
	 * @property dateCreated
	 * @type String
	 * @for Systemnotificationrecipient
	 * @public
	 */
	@attr('string') dateCreated;

	/**
	 * Date on which the recipient record was last modified
	 *
	 * @property dateModified
	 * @type String
	 * @for Systemnotificationrecipient
	 * @public
	 */
	@attr('string') dateModified;
}

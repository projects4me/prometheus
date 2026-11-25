/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { toArray } from 'prometheus/utils/array/to-array';

/**
 * The recipient record of a notification that belongs to one user
 *
 * @method recipientRecordFor
 * @param {Object} notification A systemnotification (or a plain object with `recipientRecords`)
 * @param {String} userId Id of the user, usually the current user
 * @return {Object|undefined} The user's recipient record, if loaded
 * @public
 */
export function recipientRecordFor(notification, userId) {
	if (!notification || userId === undefined || userId === null) {
		return undefined;
	}
	return toArray(notification.recipientRecords).find(
		(record) => String(record?.userId) === String(userId)
	);
}

/**
 * Whether one user has not read a notification yet, from that user's own
 * recipient record and not from whichever record happens to come first
 *
 * @method isUnreadFor
 * @param {Object} notification
 * @param {String} userId
 * @return {Boolean}
 * @public
 */
export function isUnreadFor(notification, userId) {
	return recipientRecordFor(notification, userId)?.isRead === '0';
}

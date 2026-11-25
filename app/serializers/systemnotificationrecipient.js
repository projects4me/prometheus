/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ApplicationSerializer from './application';

/**
 * Serializer for the recipient records of a system notification.
 *
 * Gaia sends `isRead` as a number (`0` or `1`). The string transform turns a
 * falsy `0` into `null`, so an unread record would never read as `'0'`. This
 * serializer maps every form Gaia can send to the `'0'` / `'1'` strings the
 * rest of the app compares against.
 *
 * @class SystemnotificationrecipientSerializer
 * @namespace Prometheus.Serializers
 * @extends ApplicationSerializer
 * @public
 */
export default class SystemnotificationrecipientSerializer extends ApplicationSerializer {
	/**
	 * Normalizes `isRead` to `'0'` or `'1'` before the attribute transforms run
	 *
	 * @method normalize
	 * @param {Object} modelClass
	 * @param {Object} resourceHash
	 * @return {Object}
	 * @public
	 */
	normalize(modelClass, resourceHash) {
		const isRead = resourceHash?.attributes?.isRead;
		if (isRead !== undefined && isRead !== null) {
			resourceHash.attributes.isRead = Number(isRead) ? '1' : '0';
		}
		return super.normalize(modelClass, resourceHash);
	}
}
